# Datentisch

Smartie Datentisch v2 UI

## Table of Contents
- Installation
- Getting Started
- Project Structure
- Development
- Creating New Projects
  - Project Directory Structure
  - Visualisation possibilities
  - Configuration with meta.json
  - HTML Panels
  - GeoJSON Structure
  - Custom Panels


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TUMFTM/sm-data-desk.git
   cd sm-data-desk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Add the MapTiler API-key into the .env file

## Getting Started

After starting the development server, open your browser to the displayed URL (typically http://localhost:5173) to see the project listing page. Click on any project card to open the associated map view.

## Project Structure

The application has the following main directory structure:

```
/sm-data-desk/
├── src/
│   ├── assets/          # Static assets like CSS and images
│   ├── components/      # Vue components
│   ├── projects/        # Project data directories
│   ├── views/           # Vue views
│   ├── App.vue          # Root Vue component
│   └── main.js          # Application entry point
├── public/              # Public static files
├── index.html           # HTML entry point
└── package.json         # Project dependencies
```


## Development

### Technology Stack
- Vue.js 3
- MapLibre GL for map rendering
- Vite for build tooling

### Customizing Styles

Global styles are defined in main.css. You can add project-specific styles within HTML panel files or create separate CSS files as needed.

## Creating New Projects

### Project Directory Structure

Each project must be in its own directory under projects:

```
/src/projects/
├── my_project/
│   ├── meta.json          # Required configuration file
│   ├── banner.png         # Required thumbnail image 
│   ├── desc.html          # Optional HTML panel
│   ├── CustomPanelContainer.vue # Optional custom vue.js component 
│   ├── BlockLeftPanelContainer.vue # Optional custom vue.js component 
│   ├── BlockRightPanelContainer.vue # Optional custom vue.js component 
│   └── layers/
│       ├── layer_1.geojson
│       ├── layer_2.geojson
│       └── layer_3.geojson
├── other_project/
│   ├── meta.json
```

**Required files:**
- `meta.json` - Project configuration, will hold your project settings
- `banner.png` - Project thumbnail image (recommended size: 300px × 200px)
- Any HTML file (e.g., `desc.html`) in the project root will automatically be included as a panel
- GeoJSON files in the `layers/` subdirectory (any filenames with `.geojson` extension)

**Additional files:**
- When needed, HTML panel file can be replaced with `CustomPanelContainer.vue`
- `BlockLeftPanelContainer.vue` and `BlockRightPanelContainer.vue` files can be used to show additional information within the blocks view

### Visualisation possibilities

Each project can be viewd in two possible ways: distributed and block. The idea of distributed view is to draw users attention to the map itself. Additionally content from `desc.html` is shown along three screen boarders: right, top and left. Blocks view is designed in the way, that additional information can be shown to user. This can be additional videos, surveys, pictures and so on. For the further details please refer to `Custon panels` section.

### Configuration with meta.json

```json
{
  "title": "Project Title",
  "center": [11.576124, 48.137154],
  "zoom": 12,
  "nimZoom": 10,
  "layers": [
    {
      "name": "Layer 1 Display Name",
      "path": "layers/layer_1.geojson",
      "visible": true
    },
    {
      "name": "Layer 2 Display Name",
      "path": "layers/layer_2.geojson",
      "visible": false
    }
  ]
}
```

**Important fields:**
- `title`: Project name displayed in the UI
- `center`: Map center coordinates `[longitude, latitude]`
- `zoom`: Initial zoom level (0-18)
- `minZoom`: Minimum map extent
- `layers`: List of data layers
  - `name`: Display name in the UI
  - `path`: Path to the GeoJSON file
  - `visible`: Whether layer is visible on startup

### HTML Panels

Information panels help explain your project data. Create HTML files in your project directory or in a `panels/` subdirectory:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Project Overview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        h1 { color: #0061C3; }
        /* Additional custom styles */
    </style>
</head>
<body>
    <h1>Project Title</h1>
    <p>Description of the project and data visualization.</p>
    
    <!-- Add explanatory content, images, charts -->
    
    <section>
        <h2>Data Sources</h2>
        <p>Information about data sources and methodology.</p>
    </section>
</body>
</html>
```

### GeoJSON Structure

Each `.geojson` file must be a valid `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [ ... ]
}
```

#### Point Features

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [11.5755, 48.1374] },
  "properties": {
    "ftype": "marker",
    "fill": "#ff9900",
    "fill_opacity": 1,
    "stroke": "#000000",
    "stroke_width": 1,
    "radius": 8,
    "popup": "<strong>Marienplatz</strong><br>City center."
  }
}
```

**Properties:**
- `ftype`: "marker" (required)
- `fill`, `fill_opacity`: Fill color & opacity
- `stroke`, `stroke_width`: Outline color & width
- `radius`: Point radius in pixels
- `popup`: HTML content for popup

#### Line Features

```json
{
  "type": "Feature",
  "geometry": { "type": "LineString", "coordinates": [ ... ] },
  "properties": {
    "ftype": "line",
    "stroke": "#e60000",
    "stroke_width": 4,
    "popup": "<strong>Tram 19</strong><br>Transit route."
  }
}
```

**Properties:** `ftype`, `stroke`, `stroke_width`, `popup`

#### Polygon Features

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [ ... ] },
  "properties": {
    "ftype": "polygon",
    "fill": "#1e90ff", 
    "fill_opacity": 0.1,
    "stroke": "#000000",
    "stroke_width": 1,
    "popup": "<strong>Schwabing</strong><br>District."
  }
}
```

**Properties:** `ftype`, `fill`, `fill_opacity`, `stroke`, `stroke_width`, `popup`

#### Mixed Geometry Types

When a GeoJSON file contains points, lines, and polygons, the system automatically splits them into separate UI layers:

1. `filename-points.geojson`
2. `filename-lines.geojson`
3. `filename-polygons.geojson`

The parent layer controls all sub-layers together.

**Example: transport_network.geojson**
```json
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "geometry": { "type": "Point", ... }, "properties": { ... } },
    { "type": "Feature", "geometry": { "type": "LineString", ... }, "properties": { ... } },
    { "type": "Feature", "geometry": { "type": "Polygon", ... }, "properties": { ... } }
  ]
}
```

### Example Projects

#### Simple POI Project

```
/src/projects/
└── tourist_spots/
    ├── meta.json
    ├── banner.png
    ├── desc.html       # Automatically detected
    └── layers/
        └── locations.geojson
```

**meta.json:**
```json
{
  "title": "Tourist Spots",
  "center": [11.576124, 48.137154],
  "zoom": 12,
  "layers": [
    { "name": "Tourist Attractions", "path": "layers/locations.geojson", "visible": true }
  ]
}
```

#### Complex Project with Multiple Layers

```
/src/projects/
└── infrastructure/
    ├── meta.json
    ├── banner.png
    ├── desc.html
    ├── CustomPanelContainer.vue
    ├── BlockLeftPanelContainer.vue
    ├── BlockRightPanelContainer.vue
    └── layers/
        ├── districts.geojson
        ├── subway_lines.geojson
        └── subway_stations.geojson
```

**meta.json:**
```json
{
  "title": "City Infrastructure",
  "center": [11.576124, 48.137154],
  "zoom": 11,
  "layers": [
    { "name": "City Districts", "path": "layers/districts.geojson", "visible": true },
    { "name": "Subway Network", "path": "layers/subway_lines.geojson", "visible": true },
    { "name": "Subway Stations", "path": "layers/subway_stations.geojson", "visible": true }
  ]
}
```

### Custom Panels

As it was mentioned earlier, panels that are shown within the distributed and block view can be modified according to the project needs.

**CustompanelContainer.vue:**
This is the container that will be displayed instead of `desc.html` when found within the project directory. You might want to do this if you would like to add custom javascript code for example. The example of such container implementation can be fount within `nefton` project. 

**BlockLeftPanelContainer.vue and BlockRightPanelContainer.vue:**
Those are the files that are utilized within the distributed view as additional information above the map. In general there are several possibilities how to use them;
1) If you dont want to show any additional content within distributed view - simply ignore those two files and dont add them to your folder sctructure. In this case the block view will only consist of description panel on the left and map on the right.
2) If you want to use the space above the map for one particular purpose, for instance slides or a video, you can save only one file (either Left or Right) and it will automatically take up all the available space. 
3) If you want to make use of both additional panels and show different content, then you need to save both files. it will automatically recognized and plotted as two blocks in a block view. 

For the further usage example please refer to the project `mcube_projects`. Three examples of additional information are shown there: slides, quiz and pie chart. 
