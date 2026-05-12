import { jsPDF } from 'jspdf';
import {
  getItineraryDestinationCountry,
  getItineraryDestinationName,
  getItineraryMoodLabel,
} from '../features/results/itineraryNormalizer.js';

const PAGE_MARGIN = 40;
const PAGE_BOTTOM_RESERVED = 56;
const PAGE_LINE_HEIGHT = 14;

function toSafeText(value, fallback = 'Not specified') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value) && value.length) return value.filter(Boolean).join(', ');
  return fallback;
}

function toDateLabel(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function sanitizeFileSlug(value) {
  return toSafeText(value, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFileName(itinerary) {
  const destinationName = getItineraryDestinationName(itinerary);
  const destinationCountry = getItineraryDestinationCountry(itinerary);
  const slug = sanitizeFileSlug([destinationName, destinationCountry].filter(Boolean).join(' '));
  return slug ? `travelmind-${slug}-itinerary.pdf` : 'travelmind-itinerary.pdf';
}

function formatDuration(stop) {
  if (!stop) return 'Not specified';
  if (typeof stop.durationLabel === 'string' && stop.durationLabel.trim()) return stop.durationLabel.trim();
  if (Number.isFinite(Number(stop.durationMinutes))) {
    const minutes = Number(stop.durationMinutes);
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = Math.round(minutes % 60);
    if (!remaining) return `${hours} h`;
    return `${hours} h ${remaining} min`;
  }
  return toSafeText(stop.duration, 'Not specified');
}

function formatCategory(category) {
  const text = toSafeText(category, 'activity');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatTransport(transport) {
  if (Array.isArray(transport)) return transport.filter(Boolean).join(', ') || 'Not specified';
  return toSafeText(transport, 'Not specified');
}

function getBestTimeToVisit(itinerary) {
  return toSafeText(
    itinerary.bestTimeToVisit || itinerary.destination?.bestTimeToVisit || itinerary.meta?.bestTimeToVisit,
    'Not specified',
  );
}

function ensurePageSpace(doc, y, neededHeight, pageHeight) {
  if (y + neededHeight > pageHeight - PAGE_BOTTOM_RESERVED) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

function splitParagraph(doc, text, width) {
  return doc.splitTextToSize(toSafeText(text, 'No description available.'), width);
}

function renderFooter(doc, footerText) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(footerText, pageWidth / 2, pageHeight - 18, { align: 'center' });
  }
}

function drawSectionHeading(doc, title, subtitle, y, width, pageHeight) {
  const lineCount = subtitle ? 2 : 1;
  y = ensurePageSpace(doc, y, 30 + (lineCount * PAGE_LINE_HEIGHT), pageHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, PAGE_MARGIN, y);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    const lines = splitParagraph(doc, subtitle, width);
    doc.text(lines, PAGE_MARGIN, y + 16);
    y += 16 + (lines.length * PAGE_LINE_HEIGHT);
  } else {
    y += 22;
  }

  return y;
}

function renderMetaLine(doc, label, value, y, width, pageHeight) {
  const text = `${label}: ${toSafeText(value)}`;
  const lines = splitParagraph(doc, text, width);
  y = ensurePageSpace(doc, y, lines.length * PAGE_LINE_HEIGHT + 6, pageHeight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(lines, PAGE_MARGIN, y);
  return y + (lines.length * PAGE_LINE_HEIGHT) + 4;
}

function renderStop(doc, stop, y, contentWidth, pageHeight) {
  const titleLines = splitParagraph(doc, `${toSafeText(stop.arrivalTime, 'Flexible')}  ${toSafeText(stop.name, 'Unnamed stop')}`, contentWidth - 24);
  const categoryLine = `Category: ${formatCategory(stop.category)} · Duration: ${formatDuration(stop)}`;
  const categoryLines = splitParagraph(doc, categoryLine, contentWidth - 24);
  const descriptionLines = splitParagraph(doc, stop.description, contentWidth - 24);
  const blockHeight = 22 + (titleLines.length * 12) + (categoryLines.length * 11) + (descriptionLines.length * 12) + 22;

  y = ensurePageSpace(doc, y, blockHeight, pageHeight);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundRect(PAGE_MARGIN, y, contentWidth, blockHeight, 14, 14, 'FD');

  let innerY = y + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(titleLines, PAGE_MARGIN + 12, innerY);
  innerY += titleLines.length * 12 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(categoryLines, PAGE_MARGIN + 12, innerY);
  innerY += categoryLines.length * 11 + 4;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(descriptionLines, PAGE_MARGIN + 12, innerY);

  return y + blockHeight + 10;
}

export function exportItineraryToPdf(itinerary) {
  if (!itinerary) {
    throw new Error('No itinerary available to export.');
  }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (PAGE_MARGIN * 2);
  const pageHeight = doc.internal.pageSize.getHeight();
  const generationDate = toDateLabel(itinerary.generatedAt);
  const footerText = `Generated with TravelMind · ${generationDate}`;

  let y = PAGE_MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('TravelMind Itinerary', PAGE_MARGIN, y);
  y += 28;

  const destinationName = getItineraryDestinationName(itinerary);
  const destinationCountry = getItineraryDestinationCountry(itinerary);
  const destinationLabel = destinationCountry ? `${destinationName}, ${destinationCountry}` : destinationName;

  y = ensurePageSpace(doc, y, 26, pageHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Trip Metadata', PAGE_MARGIN, y);
  y += 18;

  y = renderMetaLine(doc, 'Destination', destinationLabel, y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Travel Style', getItineraryMoodLabel(itinerary), y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Duration', itinerary.duration, y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Radius', itinerary.radius, y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Best Time to Visit', getBestTimeToVisit(itinerary), y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Budget', itinerary.budget, y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Transport', formatTransport(itinerary.transport), y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Travelers', `${toSafeText(itinerary.adults, '1')} adults, ${toSafeText(itinerary.children, '0')} kids`, y, contentWidth, pageHeight);
  y = renderMetaLine(doc, 'Generated', generationDate, y, contentWidth, pageHeight);

  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  if (!days.length) {
    y = ensurePageSpace(doc, y, 40, pageHeight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('No itinerary details available.', PAGE_MARGIN, y + 10);
    y += 28;
  } else {
    y += 8;
    days.forEach((day) => {
      const dayTitle = `Day ${toSafeText(day.day, '')}${day.title ? `: ${day.title}` : ''}`;
      const stopCount = Array.isArray(day.stops) ? day.stops.length : 0;
      const daySubtitle = `${stopCount} stop${stopCount === 1 ? '' : 's'} planned`;
      y = drawSectionHeading(doc, dayTitle, daySubtitle, y, contentWidth, pageHeight);

      const stops = Array.isArray(day.stops) ? day.stops : [];
      stops.forEach((stop) => {
        y = renderStop(doc, stop, y, contentWidth, pageHeight);
      });

      y += 2;
    });
  }

  renderFooter(doc, footerText);
  doc.save(buildFileName(itinerary));
}
