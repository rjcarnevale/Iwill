"use client";

import { jsPDF } from "jspdf";
import { Will, Profile } from "@/lib/types";

interface ExportWillButtonProps {
  profile: Profile;
  wills: Will[];
}

export function ExportWillButton({ profile, wills }: ExportWillButtonProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 25;

    const displayName = profile.display_name || profile.username;
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Helper to check for page break
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = 25;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARATION OF DISTRIBUTION WISHES", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Declaration paragraph 1
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const para1 = `I, ${displayName}, being of sound mind and memory, do hereby declare the following to be my wishes regarding the distribution of the personal property listed herein.`;
    const para1Lines = doc.splitTextToSize(para1, contentWidth);
    doc.text(para1Lines, margin, yPos);
    yPos += para1Lines.length * 5 + 8;

    // Declaration paragraph 2
    const para2 = `The items described in this document are to be distributed to the named recipients upon my passing, in accordance with the terms outlined below.`;
    const para2Lines = doc.splitTextToSize(para2, contentWidth);
    doc.text(para2Lines, margin, yPos);
    yPos += para2Lines.length * 5 + 8;

    // Declaration paragraph 3
    const para3 = `Each item has been assigned a sole intended recipient. Where multiple recipients are named for a single item, distribution shall be divided equally unless otherwise noted.`;
    const para3Lines = doc.splitTextToSize(para3, contentWidth);
    doc.text(para3Lines, margin, yPos);
    yPos += para3Lines.length * 5 + 8;

    // Declaration paragraph 4
    const para4 = `This document was prepared and signed voluntarily, without undue influence or coercion.`;
    const para4Lines = doc.splitTextToSize(para4, contentWidth);
    doc.text(para4Lines, margin, yPos);
    yPos += para4Lines.length * 5 + 15;

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Items section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ITEMS TO BE DISTRIBUTED", margin, yPos);
    yPos += 12;

    if (wills.length === 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.text("No items have been listed yet.", margin, yPos);
      yPos += 15;
    } else {
      wills.forEach((will, index) => {
        checkPageBreak(20);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const recipientName = will.recipient?.display_name ||
                              will.recipient?.username ||
                              will.recipient_email ||
                              "Unspecified recipient";

        doc.text(`${index + 1}. ${will.item_description}`, margin, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        doc.text(`    To: ${recipientName}`, margin, yPos);
        yPos += 10;
      });
    }

    // Executor section (if they have one set)
    if (profile.executor_email) {
      checkPageBreak(30);
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTOR", margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const executorText = `I hereby designate ${profile.executor_email} as the executor of this declaration, to ensure my wishes regarding the above items are communicated to the intended recipients.`;
      const executorLines = doc.splitTextToSize(executorText, contentWidth);
      doc.text(executorLines, margin, yPos);
      yPos += executorLines.length * 5 + 10;
    }

    // Signature section
    checkPageBreak(100);
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;

    // Prepared by info
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Prepared by: ${displayName}`, margin, yPos);
    yPos += 8;
    doc.text(`Date: ${today}`, margin, yPos);
    yPos += 8;
    doc.text(`Generated via: Iwill (gotwilled.com)`, margin, yPos);
    yPos += 25;

    // Signature line
    doc.text("Signature: ", margin, yPos);
    doc.line(margin + 25, yPos, pageWidth - margin, yPos);
    yPos += 25;

    // Witness lines
    doc.text("Witness: ", margin, yPos);
    doc.line(margin + 22, yPos, pageWidth - margin, yPos);
    yPos += 20;

    doc.text("Witness: ", margin, yPos);
    doc.line(margin + 22, yPos, pageWidth - margin, yPos);

    // Save the PDF
    const fileName = `${profile.username}-will-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      className="px-4 py-1.5 border border-[var(--card-border)] rounded-full text-sm hover:bg-white/5 transition flex items-center gap-2"
    >
      <span>📄</span>
      <span>Export Will</span>
    </button>
  );
}
