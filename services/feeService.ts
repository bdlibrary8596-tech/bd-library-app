
import * as dateFns from 'date-fns';
import type { PaymentInfo, Student } from '../types';

/**
 * Safely converts a `payments` field into a guaranteed array of PaymentInfo.
 */
export function normalizePayments(payments: any): PaymentInfo[] {
  if (Array.isArray(payments)) {
    return payments;
  }
  if (payments && typeof payments === 'object') {
    return Object.values(payments);
  }
  return [];
}

/**
 * A comprehensive fee calculator for a single student.
 * @param student The student object.
 * @returns An object with detailed fee statistics.
 */
export function getStudentFeeStats(student: Student) {
    const { joinDate, monthlyFee, payments, status, exitDate } = student;
    const paymentsArray = normalizePayments(payments);

    if (!joinDate) {
        return { unpaidCount: 0, totalUnpaidAmount: 0, unpaidList: [], lastPaidMonth: null, nextDueDate: null };
    }

    const start = dateFns.startOfMonth(new Date(joinDate));
    const now = new Date();
    
    const end = (status === 'inactive' || status === 'softDeleted') && exitDate
        ? dateFns.startOfMonth(new Date(exitDate))
        : dateFns.startOfMonth(now);

    const paidSet = new Set(
        paymentsArray.filter(p => p.status === 'paid').map(p => p.monthKey)
    );

    let unpaidCount = 0;
    const unpaidList: string[] = [];
    let lastPaidMonth: string | null = null;
    
    if (dateFns.isBefore(end, start)) {
        return { unpaidCount: 0, totalUnpaidAmount: 0, unpaidList: [], lastPaidMonth: null, nextDueDate: null };
    }
  
    const monthsInInterval = dateFns.eachMonthOfInterval({ start, end });

    for (const monthDate of monthsInInterval) {
        const monthKey = dateFns.format(monthDate, 'yyyy-MM');
        if (!paidSet.has(monthKey)) {
            unpaidCount++;
            unpaidList.push(dateFns.format(monthDate, 'MMM yyyy'));
        } else {
            lastPaidMonth = dateFns.format(monthDate, 'MMM yyyy');
        }
    }

    const totalUnpaidAmount = unpaidCount * monthlyFee;

    const dueDay = student.dueDay || new Date(joinDate).getDate();
    let nextDueDate: Date | null = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (dateFns.isBefore(nextDueDate, now)) {
        nextDueDate = dateFns.addMonths(nextDueDate, 1);
    }
    
    return { 
        unpaidCount, 
        totalUnpaidAmount, 
        unpaidList, 
        lastPaidMonth,
        nextDueDate: dateFns.format(nextDueDate, 'MMM d, yyyy')
    };
}
