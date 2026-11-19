// Fixed scenes for the screenshots (tools/capture-shots.mjs opens them): ?shot=cover shows the cover alone, drawn by
// the same renderer as the PNG export at the preview size of its format (1280x720, 1024x1280 or 1080x1080);
// ?shot=editor shows the whole editor with a panel selected. The other parameters set the document:
// format, layout, grade, style, title, tagline (a | is a line break), photos (comma-separated ids) and panel.
// window.__shotReady is set once the frame is painted.

export async function runShot(query, studio) {
  const { doc } = studio;
  for (const key of ['format', 'layout', 'grade', 'style']) if (query.get(key)) doc[key] = query.get(key);
  if (query.has('title')) doc.title = query.get('title').replace(/\|/g, '\n');
  if (query.has('tagline')) doc.tagline = query.get('tagline');
  if (query.has('strength')) doc.strength = Number(query.get('strength'));
  if (query.get('photos')) studio.fillPanels(query.get('photos').split(',').filter((id) => studio.photos.has(id)));
  for (const crop of query.getAll('crop')) {
    const [i, zoom, cx, cy] = crop.split(':').map(Number);
    Object.assign(doc.panels[i], { zoom, cx, cy });
  }
  studio.syncControls();
  if (query.get('shot') === 'cover') {
    document.body.classList.add('shot-cover');
    studio.drawNow(false);
  } else {
    studio.selectPanel(Number(query.get('panel') ?? 0));
    studio.drawNow(true);
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
