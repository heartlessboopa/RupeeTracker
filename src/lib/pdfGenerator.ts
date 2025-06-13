
"use client";
// Removed static imports for jspdf and jspdf-autotable from here
import type { Expense } from '@/types';
import { format } from 'date-fns';

// jsPDF and jsPDFAutoTable types are globally available or handled by tsconfig/globals,
// but for the autoTable extension method, we still need to inform TypeScript.
// The actual 'jspdf-autotable' import that patches jsPDF will be dynamic.
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateExpenseReportPDF = async (
  expenses: Expense[],
  reportTitle: string,
  filterDescription: string
) => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable'); // This import executes the plugin

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(reportTitle, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100); // Muted text color for description
  doc.text(filterDescription, 14, 30);

  const tableColumn = ["Date", "Description", "Category", "Amount (₹)"];
  const tableRows: (string | number)[][] = [];

  expenses.forEach(expense => {
    const expenseData = [
      format(new Date(expense.date), "dd MMM, yyyy"),
      expense.description,
      expense.category,
      expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ];
    tableRows.push(expenseData);
  });

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalRow = ["", "", "Total Expenses:", totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
  tableRows.push(totalRow);


  doc.autoTable({
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid', // 'striped', 'grid', or 'plain'
    headStyles: { 
        fillColor: [52, 73, 94], // Dark blue-gray for header
        textColor: [255, 255, 255] 
    }, 
    footStyles: { 
        fillColor: [236, 240, 241], // Light gray for footer
        textColor: [44, 62, 80],
        fontStyle: 'bold'
    },
    styles: { fontSize: 10 },
    columnStyles: {
      3: { halign: 'right' }, // Align amount column to the right
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages(); 
      doc.setFontSize(10);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      doc.text(`Report Generated: ${format(new Date(), "dd MMM, yyyy HH:mm")}`, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
    },
    willDrawCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
            doc.setFont(undefined, 'bold');
        }
    }
  });
  
  doc.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_report.pdf`);
};

