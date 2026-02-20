import html2canvas from 'html2canvas';

export async function exportListAsImage(elementId: string, filename: string = 'grocery-list'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for export');
  }

  try {
    // Add temporary styling for export
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Restore original styling
    element.style.backgroundColor = originalBg;

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting list:', error);
    throw error;
  }
}
