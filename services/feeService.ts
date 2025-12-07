// FIX: The original deconstructed import from 'date-fns' was causing an error as 'startOfMonth' could not be found.
// Switched to a namespace import (`import * as dateFns`) to ensure all functions are available and resolve the issue.
import * as dateFns from 'date-fns';
// FIX: Import Student type to use in function signatures and for the new helper function.
import type { PaymentInfo, Student } from '../types';

/**
 * Safely converts a `payments` field (which could be an array, object, or null/undefined)
 * into a guaranteed array of PaymentInfo.
 * @param payments The raw payments data from Firestore.
 * @returns A valid PaymentInfo[] array.
 */
export function normalizePayments(payments: any): PaymentInfo[] {
  if (Array.isArray(payments)) {
    return payments;
  }
  // Handles cases where payments might be an object (from older data structures)
  if (payments && typeof payments === 'object') {
    return Object.values(payments);
  }
  // Returns an empty array for null, undefined, or other invalid types
  return [];
}


/**
 * Calculates fee statistics for a student.
 * @param joinDate The student's join date in 'YYYY-MM-DD' format.
 * @param monthlyFee The student's monthly fee.
 * @param payments An array of payments made by the student.
 * @param status The student's current status ('active', 'inactive', 'softDeleted', etc.).
 * @param leftDate The date the student left, if inactive.
 * @returns An object with unpaid months, total due, and a list of unpaid month names.
 */
export function calculateFeeStats(
  joinDate: string,
  monthlyFee: number,
  payments: any, // Accept any type to be robust
  // FIX: Widen status type to match the Student interface and prevent potential type errors.
  status: Student['status'],
  leftDate?: string | null
) {
  const paymentsArray = normalizePayments(payments);

  if (!joinDate) {
    return { unpaidMonths: 0, totalDue: 0, unpaidList: [] };
  }

  const start = dateFns.startOfMonth(new Date(joinDate));
  const now = new Date();
  
  // Determine the end date for fee calculation
  // FIX: Correctly handle 'softDeleted' status for accurate fee calculation.
  const end = (status === 'inactive' || status === 'softDeleted') && leftDate
    ? dateFns.startOfMonth(new Date(leftDate))
    : dateFns.startOfMonth(now);

  // Create a Set of paid months for quick lookup (e.g., "2024-9")
  const paidSet = new Set(
    paymentsArray.map(p => `${p.year}-${p.month}`)
  );

  let unpaidMonths = 0;
  const unpaidList: string[] = [];
  
  // If the end date is before the start date, no fees are due
  if (dateFns.isBefore(end, start)) {
      return { unpaidMonths: 0, totalDue: 0, unpaidList: [] };
  }
  
  const interval = { start, end };
  const monthsInInterval = dateFns.eachMonthOfInterval(interval);
  
  // Also include the end month itself if not already included
  if (monthsInInterval.length > 0) {
      const lastMonth = monthsInInterval[monthsInInterval.length - 1];
      if (lastMonth.getMonth() !== end.getMonth() || lastMonth.getFullYear() !== end.getFullYear()) {
           if (dateFns.isBefore(lastMonth, end)) {
               monthsInInterval.push(end);
           }
      }
  } else {
       // Handle case where join date and end date are in the same month
       monthsInInterval.push(start);
  }


  for (const monthDate of monthsInInterval) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    const key = `${year}-${month}`;
    
    if (!paidSet.has(key)) {
      unpaidMonths++;
      unpaidList.push(monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
  }

  const totalDue = unpaidMonths * monthlyFee;

  return { unpaidMonths, totalDue, unpaidList };
}

/**
 * A wrapper for calculateFeeStats that accepts a full student object.
 * This function was missing, causing errors in multiple components.
 * @param student The student object.
 * @returns An object with fee statistics.
 */
// FIX: Add missing getStudentFeeStats function to resolve import errors.
export function getStudentFeeStats(student: Student) {
    // FIX: Standardize property names to prevent type errors in consumer components.
    // This wrapper ensures that components like StudentCard and StudentDetailModal
    // receive the expected 'unpaidCount' and 'totalUnpaidAmount' properties.
    const { unpaidMonths, totalDue, unpaidList } = calculateFeeStats(
        student.joinDate,
        student.monthlyFee,
        student.payments,
        student.status,
        student.leftDate
    );
    return {
        unpaidMonths,
        totalDue,
        unpaidList,
        unpaidCount: unpaidMonths,
        totalUnpaidAmount: totalDue,
    };
}
