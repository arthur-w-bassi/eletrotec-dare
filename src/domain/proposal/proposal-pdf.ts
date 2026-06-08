import type { ProposalCover } from "./proposal-types";

const PDF_SCALE = 2;

function sanitizeFilenameSegment(value: string): string {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildProposalPdfFilename(cover: ProposalCover): string {
  const number = sanitizeFilenameSegment(cover.number || "proposta");
  return `proposta-${number}.pdf`;
}

function getPreviewScaleWrapper(element: HTMLElement): HTMLElement | null {
  return element.closest("[data-proposal-preview-scale]");
}

function prepareElementForCapture(element: HTMLElement): () => void {
  const scaleWrapper = getPreviewScaleWrapper(element);
  const originalTransform = scaleWrapper?.style.transform ?? "";
  const originalWidth = scaleWrapper?.style.width ?? "";

  element.setAttribute("data-proposal-export", "true");

  if (scaleWrapper) {
    scaleWrapper.style.transform = "none";
    scaleWrapper.style.width = "100%";
  }

  return () => {
    element.removeAttribute("data-proposal-export");

    if (scaleWrapper) {
      scaleWrapper.style.transform = originalTransform;
      scaleWrapper.style.width = originalWidth;
    }
  };
}

export async function captureElementAsPdfBlob(element: HTMLElement): Promise<Blob> {
  const restoreCaptureState = prepareElementForCapture(element);

  try {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(element, {
      scale: PDF_SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDocument, clonedElement) => {
        clonedElement.querySelectorAll("img").forEach((image) => {
          image.crossOrigin = "anonymous";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } finally {
    restoreCaptureState();
  }
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function openPdfBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
