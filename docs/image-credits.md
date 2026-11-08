# TRENDWISE — Image Credits & Asset Register

*Version 1.0 · 8 November 2026*

In accordance with Section 1 and Section 13.5 of the project specification:

1. **Zero Proprietary or Copyrighted Images Bundled:**
   No retailer imagery, commercial garment lookbooks, or third-party stock photos are bundled into the application repository.

2. **Procedural CSS/SVG Swatches:**
   All colour swatches rendered on trend cards, trend detail banners, and printable research reports are dynamically generated using CSS and SVG procedural textures (`.swatch-woven` radial gradient overlay) that emulate textile weave patterns without relying on external raster files.

3. **Optional User Image Overrides:**
   The application architecture supports optional photographic lookbook swatch overrides placed into `public/images/trends/{trend_id}.jpg`. If absent, the app automatically and cleanly displays the procedural CSS/SVG swatch composition labelled with the caption *"Illustrative colour swatch"*.

