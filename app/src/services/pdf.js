import { jsPDF } from 'jspdf';
import { getItineraryDestinationName } from '../features/results/itineraryNormalizer.js';

export function exportItineraryToPdf(itinerary) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const titleY = 40;
  const destinationName = getItineraryDestinationName(itinerary);

  doc.setFontSize(22);
  doc.text(`TravelMind · ${destinationName}`, 40, titleY);
  doc.setFontSize(12);
  doc.text(`Mood: ${itinerary.mood} • Duration: ${itinerary.duration} • Radius: ${itinerary.radius}`, 40, titleY + 24);
  doc.setTextColor(100);
  doc.text(`Generated ${new Date(itinerary.generatedAt).toLocaleDateString()}`, 40, titleY + 44);
  drawRouteGraphic(doc, 40, 90, 520, 130);

  let y = 240;
  itinerary.days.forEach((day) => {
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(day.title, 40, y);
    y += 22;

    day.stops.forEach((stop) => {
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text(`• ${stop.time} ${stop.name} (${stop.duration})`, 48, y);
      y += 16;

      const lines = doc.splitTextToSize(stop.description, 500);
      doc.setFontSize(10);
      doc.text(lines, 52, y);
      y += lines.length * 12 + 12;

      if (y > 730) {
        doc.addPage();
        y = 40;
      }
    });
  });

  doc.save(`${destinationName.replace(/\s+/g, '_')}_Itinerary.pdf`);
}

function drawRouteGraphic(doc, x, y, width, height) {
  doc.setFillColor(235, 245, 255);
  doc.roundRect(x, y, width, height, 14, 14, 'F');
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(2);
  const margin = 18;
  doc.line(x + margin, y + height / 2, x + width - margin, y + height / 2);
  for (let i = 0; i < 5; i += 1) {
    const px = x + margin + ((width - margin * 2) / 4) * i;
    doc.circle(px, y + height / 2, 4, 'F');
  }
}
