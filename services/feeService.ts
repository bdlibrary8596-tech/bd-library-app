
import { 
    startOfMonth, 
    endOfMonth, 
    eachMonthOfInterval, 
    isBefore, 
    isSameDay,
    parseISO
} from 'date-fns';
import type { PaymentInfo, Student } from '../types';

/**
 * Calculates fee statistics for a student.
 * @param joinDate The student's join date in 'YYYY-MM-DD' format.
 * @param monthlyFee The student's monthly fee.
 * @param payments An array of payments made by the student.
 * @param status The student's current status ('active' or 'inactive').
 * @param leftDate The date the student left, if inactive.
 * @returns An object with unpaid months, total due, and a list of unpaid month names.
 */
export function calculateFeeStats(
  joinDate: string,
  monthlyFee: number,
  payments: PaymentInfo[],
  status: 'active' | 'inactive',
  leftDate?: string | null
) {
  if (!joinDate) {
    return { unpaidMonths: 0, totalDue: 0, unpaidList: [] };
  }

  const start = startOfMonth(new Date(joinDate));
  const now = new Date();
  
  // Determine the end date for fee calculation
  const end = status === 'inactive' && leftDate
    ? startOfMonth(new Date(leftDate))
    : startOfMonth(now);

  // Create a Set of paid months for quick lookup (e.g., "2024-9")
  const paidSet = new Set(
    payments.map(p => `${p.year}-${p.month}`)
  );

  let unpaidMonths = 0;
  const unpaidList: string[] = [];
  
  // If the end date is before the start date, no fees are due
  if (isBefore(end, start)) {
      return { unpaidMonths: 0, totalDue: 0, unpaidList: [] };
  }
  
  const interval = { start, end };
  const monthsInInterval = eachMonthOfInterval(interval);
  
  // Also include the end month itself if not already included
  if (monthsInInterval.length > 0) {
      const lastMonth = monthsInInterval[monthsInInterval.length - 1];
      if (lastMonth.getMonth() !== end.getMonth() || lastMonth.getFullYear() !== end.getFullYear()) {
           if (isBefore(lastMonth, end)) {
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
