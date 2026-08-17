import * as toGeoJSON from '@tmcw/togeojson'

export async function loadKml(file) {
    const response = await fetch(file)

    if (!response.ok) {
        throw new Error(`Failed to load KML: ${response.status}`)
    }

    const kmlText = await response.text()

    const parser = new DOMParser()

    const kml = parser.parseFromString(
        kmlText,
        'text/xml'
    )

    const parserError = kml.querySelector('parsererror')

    if (parserError) {
        throw new Error('Invalid KML file')
    }

    return toGeoJSON.kml(kml)
}