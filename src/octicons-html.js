import { window } from 'global';
import data from 'octicons/build/data.json';
import domReady from 'lite-ready';
import classnames from 'classnames/dedupe';

const defaultAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    fill: 'currentColor',
};

/**
 * Convert attributes object to string of HTML attributes.
 * @param {Object} attrs
 * @returns {string}
 */
function attrsToString(attrs) {
    return Object.keys(attrs)
        .map(key => `${key}="${attrs[key]}"`)
        .join(' ');
}

/**
 * Prepare icons list
 */
Object.keys(data).forEach((name) => {
    // Set all the default options
    const attrs = {
        ...defaultAttrs,
        ...{
            viewBox: `0 0 ${data[name].width} ${data[name].height}`,
            class: `octicon octicon-${name}`,
        },
    };

    // Function to return an SVG object
    data[name].toSvg = function (userAttrs = {}) {
        const combinedAttrs = {
            ...attrs,
            ...userAttrs,
            ...{ class: classnames(attrs.class, userAttrs.class) },
        };

        return `<svg ${attrsToString(combinedAttrs)}>${data[name].path}</svg>`;
    };
});


/**
 * Get the attributes of an HTML element.
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getAttrs(element) {
    return Array.from(element.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});
}

/**
 * Replace a single HTML element with SVG markup
 * corresponding to the element's `data-octicon` attribute value.
 * @param {HTMLElement} element
 * @param {Object} attrs
 */
function replaceElement(element, attrs = {}) {
    const elementAttrs = getAttrs(element);
    const name = elementAttrs['data-octicon'];
    delete elementAttrs['data-octicon'];

    if (typeof data[name] === 'undefined') {
        return;
    }

    const opts = {
        ...attrs,
        ...elementAttrs,
        ...{ class: classnames(attrs.class, elementAttrs.class) },
    };
    const svgString = data[name].toSvg(opts);

    const svgDocument = new DOMParser().parseFromString(
        svgString,
        'image/svg+xml',
    );
    const svgElement = svgDocument.querySelector('svg');

    element.parentNode.replaceChild(svgElement, element);
}

// Global octicons object with helpful methods.
window.octicons = {
    icons: data,
    replace(elementsToReplace = false) {
        if (!elementsToReplace) {
            elementsToReplace = document.querySelectorAll('[data-octicon]');
        }

        Array.from(elementsToReplace).forEach((element) => {
            replaceElement(element);
        });
    },
};

// Automatically replace icons.
window.octicons.replace();

if (window.MutationObserver) {
    new window.MutationObserver((mutationData) => {
        if (!mutationData || !mutationData.length) {
            return;
        }
        mutationData.forEach((items) => {
            if (!items.addedNodes || !items.addedNodes.length) {
                return;
            }
            items.addedNodes.forEach((element) => {
                if (!element.attributes || !element.attributes['data-octicon']) {
                    return;
                }
                window.octicons.replace([element]);
            });
        });
    })
        .observe(document.documentElement, {
            childList: true, subtree: true,
        });
} else {
    domReady(() => {
        window.octicons.replace();
    });
}
