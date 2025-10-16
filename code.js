// This plugin creates a new A4 page filled with passport-sized photos
// based on the user's selected image.

// Show the UI
figma.showUI(__html__, { width: 320, height: 240, title: "Passport Photo Assistant" });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-sheet') {

    // 1. --- VALIDATION ---
    // Check if exactly one item is selected
    if (figma.currentPage.selection.length !== 1) {
      figma.notify('Please select a single image layer.', { error: true });
      return;
    }
    const selectedNode = figma.currentPage.selection[0];

    // Check if the selected item has an image fill
    const isImage = selectedNode.fills.some(fill => fill.type === 'IMAGE');
    if (!isImage) {
      figma.notify('Please select a layer with an image fill.', { error: true });
      return;
    }

    figma.notify('Processing... Please wait.');

    // 2. --- CONSTANTS AND CONVERSIONS ---
    // Standard DPI for printing
    const DPI = 300;
    const MM_TO_INCH = 1 / 25.4;
    const mmToPx = (mm) => Math.round(mm * MM_TO_INCH * DPI);

    // A4 paper dimensions (210mm x 297mm)
    const A4_WIDTH_PX = mmToPx(210);
    const A4_HEIGHT_PX = mmToPx(297);

    // Standard Passport Photo dimensions (35mm x 45mm)
    const PHOTO_WIDTH_PX = mmToPx(35);
    const PHOTO_HEIGHT_PX = mmToPx(45);

    // Layout settings
    const MARGIN_PX = mmToPx(10); // Margin from paper edge
    const SPACING_PX = mmToPx(5); // Space between photos

    // 3. --- FRAME CREATION ---
    // Create the A4 frame
    const a4Frame = figma.createFrame();
    a4Frame.name = 'Passport Photo Sheet (A4)';
    a4Frame.resize(A4_WIDTH_PX, A4_HEIGHT_PX);
    a4Frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White background
    // Position the new frame to the right of the selected element
    a4Frame.x = selectedNode.x + selectedNode.width + 100;
    a4Frame.y = selectedNode.y;


    // 4. --- PHOTO PREPARATION ---
    // Clone the selected node to use as our master photo
    const masterPhoto = selectedNode.clone();
    masterPhoto.resize(PHOTO_WIDTH_PX, PHOTO_HEIGHT_PX);
    // Optional: Add a thin border for easier cutting
    masterPhoto.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
    masterPhoto.strokeWeight = 1;


    // 5. --- GRID LAYOUT LOGIC ---
    let photosPlaced = 0;
    for (let y = MARGIN_PX; y < A4_HEIGHT_PX - PHOTO_HEIGHT_PX - MARGIN_PX; y += PHOTO_HEIGHT_PX + SPACING_PX) {
      for (let x = MARGIN_PX; x < A4_WIDTH_PX - PHOTO_WIDTH_PX - MARGIN_PX; x += PHOTO_WIDTH_PX + SPACING_PX) {
        
        // Check if the next photo would go out of bounds
        if (x + PHOTO_WIDTH_PX > A4_WIDTH_PX - MARGIN_PX || y + PHOTO_HEIGHT_PX > A4_HEIGHT_PX - MARGIN_PX) {
            continue;
        }

        const newPhoto = masterPhoto.clone();
        newPhoto.x = x;
        newPhoto.y = y;
        a4Frame.appendChild(newPhoto);
        photosPlaced++;
      }
    }

    // Clean up the master photo instance we cloned
    masterPhoto.remove();


    // 6. --- FINALIZATION ---
    // Add the new frame to the canvas and zoom into it
    figma.currentPage.appendChild(a4Frame);
    figma.viewport.scrollAndZoomIntoView([a4Frame]);

    figma.notify(`✅ Successfully created A4 sheet with ${photosPlaced} photos!`);
    
    // We can close the plugin now
    // figma.closePlugin(); // Keep UI open if you want to allow creating more
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
