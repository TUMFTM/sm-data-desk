// very small subset just enough for MapCanvas
export const touchHandler = {
    addScroll(selector, callback) {
        /* eslint-disable no-unused-vars */
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('wheel', e => {
                callback('scroll', el, { x: e.deltaX, y: e.deltaY })
            })
        })
    }
}
