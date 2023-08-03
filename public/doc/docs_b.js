// Ensure that there is the correct number of tabs and content
// in index.html

// The B section of content
let BTITLES = ['circle', 'ellipse', 'point', 'line', 'square', 'rect', 'quad', 'triangle', 'arc', 'curve', 'beziercurve']

let b1a = `{ what: 'circle' },`
let b1b = `{
        what: 'circle',
        when: true,
        where: {
            x: 30,
            y: 30
        },
        how: {
            d: 30,
            fill: color(0, 0, 255, 255),
            stroke: 0,
            strokeWeight: 1,
        }
    },`

let b2a = `{ what: 'ellipse' },`
let b2b = `{
        what: 'ellipse',
        when: true,
        where: {
            x: 30,
            y: 30
        },
        how: {
            w: 30,
            h: 60,
            fill: color(255, 0, 0, 255),
            stroke: 0,
            strokeWeight: 1,
        }
    },`

let b3a = `{ what: 'point' },`
let b3b = `{
        what: 'point',
        when: true,
        where: {
            x: 30,
            y: 30
        },
        how: {
            stroke: 0,
            strokeWeight: 10,
        }
    },`

let b4a = `{ what: 'line' },`
let b4b = `{
        what: 'line',
        when: true,
        where: {
            x1: 30,
            y1: 30,
            x2: 60,
            y2: 80,
        },
        how: {
            stroke: 0,
            strokeWeight: 10,
        }
    },`

let b5a = `{ what: 'square' },`
let b5b = `{
        what: 'square',
        when: true,
        where: {
            x: 30,
            y: 30
        },
        how: {
            s: 30,

            tl: 4, // corner rounding (top left)
            tr: 4,
            bl: 0,
            br: 0,

            fill: 'rgba(0, 255, 0, 255)',
            stroke: 0,
            strokeWeight: 1
        }
    },`

let b6a = `{ what: 'rect' },`
let b6b = `{
        what: 'rect',
        when: true,
        where: {
            x: 30,
            y: 30
        },
        how: {
            h: 30,
            w: 60,

            tl: 4, // corner rounding (top left)
            tr: 4,
            bl: 0,
            br: 0,

            fill: 'rgba(255, 0, 255, 255)',
            stroke: 0,
            strokeWeight: 1
        }
    },`

let b7a = `{ what: 'quad' },`
let b7b = `{
        what: 'quad',
        when: true,
        where: {
            x1: 30,
            y1: 30,
            x2: 45,
            y2: 55,
            x3: 90,
            y3: 80,
            x4: 75,
            y4: 0
        },
        how: {
            fill: 'rgba(255, 255, 255, 255)',
            stroke: 0,
            strokeWeight: 1
        }
    },`

let b8a = `{ what: 'triangle' },`
let b8b = `{
        what: 'triangle',
        when: true,
        where: {
            x1: 30,
            y1: 30,
            x2: 60,
            y2: 60,
            x3: 100,
            y3: 10
        },
        how: {
            fill: 'rgba(255, 255, 0, 255)',
            stroke: 0,
            strokeWeight: 1
        }
    },`

let b9a = `{ what: 'arc' },`
let b9b = `{
        what: 'arc',
        when: true,
        where: {
            x: 30,
            y: 30,
        },
        how: {
            w: 60,
            h: 60,
            r: 3,
            start: 0, // between 0 and TWO_PI
            stop: HALF_PI, // between 0 and TWO_PI
            fill: 'rgba(255, 255, 0, 255)',
            stroke: 0,
            strokeWeight: 1
        }
    },`

let b10a = `{ what: 'curve' },`
let b10b = `{
    what: 'curve',
        when: true,
        where: {
            x1: 50,//start point x
            y1: 200,//start point y
            x2: 150,// Control point (150, 100) and end point (250, 200)
            y2: 100,
            x3: 250,
            y3: 200
        },
        how: {
            fill: 'rgba(255, 255, 255, 255)',
            stroke: 0,
            strokeWeight: 1
        }
},`

let b11a = `{ what: 'beziercurve' },`
let b11b = `{
    what: 'beziercurve',
        when: true,
        where: {
            x1: 50,//start point x
            y1: 200,//start point y
            x2: 100,// Control point (150, 100) and end point (250, 200)
            y2: 100,
            x3: 300,
            y3: 100,
            x4: 350,
            y4: 200
        },
        how: {
            fill: 'rgba(255, 255, 255, 255)',
            stroke: 0,
            strokeWeight: 1
        }
},`

// Must be a list of lists of code examples
// Probably in the future this could include text and examples
let BCODE = [
    [
        { code: b1a, description: 'minimal' },
        { code: b1b, description: 'expanded' }
    ],
    [
        { code: b2a, description: 'minimal' },
        { code: b2b, description: 'expanded' }
    ],
    [
        { code: b3a, description: 'minimal' },
        { code: b3b, description: 'expanded' }
    ],
    [
        { code: b4a, description: 'minimal' },
        { code: b4b, description: 'expanded' }
    ],
    [
        { code: b5a, description: 'minimal' },
        { code: b5b, description: 'expanded' }
    ],
    [
        { code: b6a, description: 'minimal' },
        { code: b6b, description: 'expanded' }
    ],
    [
        { code: b7a, description: 'minimal' },
        { code: b7b, description: 'expanded' }
    ],
    [
        { code: b8a, description: 'minimal' },
        { code: b8b, description: 'expanded' }
    ],
    [
        { code: b9a, description: 'minimal' },
        { code: b9b, description: 'expanded' }
    ],
    [
        { code: b10a, description: 'minimal' },
        { code: b10b, description: 'expanded' }
    ],
    [
        { code: b11a, description: 'minimal' },
        { code: b11b, description: 'expanded' }
    ]
]
