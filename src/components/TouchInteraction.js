class MultiTouchHandler {
    // Customized multitouch interaction made by David Ziegler @ TUM, FTM 2023
    constructor(min_scroll, max_scroll, only_touch) {
        this.only_touch = only_touch || false;
        this.min_scroll = min_scroll || 20;
        this.max_scroll = max_scroll || 30;
        this.touchBuf = [];
        this.interactions = [];
    }

    compareArrays(a, b) {
        if (a.length !== b.length) return false;
        else {
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
    }

    initialize() {
        const that = this;

        // Start touch
        document.addEventListener("touchstart", function (event) {
            for (const interaction of that.interactions) {
                const key = interaction[0]
                const action = interaction[1];
                const callback = interaction[2];
                const target = event.target.closest(key);
                if (target) {
                    for (const touch of event.changedTouches) {
                        var state = 'new'
                        const id = touch.identifier;
                        for (const buf of that.touchBuf) {
                            if (id == buf.id && action == buf.action && target == buf.target) {
                                switch (action) {
                                    case "scroll":
                                        buf.valid = false;
                                        buf.target = target;
                                        break;
                                    case "tap":
                                        buf.valid = true;
                                        buf.target = target;
                                        break;
                                }
                                state = 'modify'
                            }
                        }
                        if (state == 'new') {
                            console.log("Start", id)
                            switch (action) {
                                case "scroll":
                                    that.touchBuf.push({ "id": id, "action": action, "target": target, "target_key": key, "callback": callback, "event": touch, "store": {}, "valid": false });
                                    break;
                                case "tap":
                                    that.touchBuf.push({ "id": id, "action": action, "target": target, "target_key": key, "callback": callback, "event": touch, "store": {}, "valid": true });
                                    break;
                            }
                        }
                    }
                }
            }
        });

        document.addEventListener("touchmove", function (event) {
            for (const touch of event.changedTouches) {
                const id = touch.identifier;
                for (const buf of that.touchBuf) {
                    const target = buf.target;
                    const target_key = buf.target_key;
                    if (id == buf.id && event.target.closest(target_key) == target) {
                        const action = buf.action;
                        const startTouch = buf.event;
                        const interaction = buf.interaction;
                        const cb = buf.callback;
                        switch (action) {
                            case "scroll":
                                if (buf.valid == true && Math.max(Math.abs(touch.clientX - startTouch.clientX), Math.abs(touch.clientY - startTouch.clientY)) < that.max_scroll) {
                                    cb(action, target, { x: touch.clientX - buf.store.clientX, y: touch.clientY - buf.store.clientY }, event);
                                    buf.store["clientX"] = touch.clientX;
                                    buf.store["clientY"] = touch.clientY;
                                } else if (Math.max(Math.abs(touch.clientX - startTouch.clientX), Math.abs(touch.clientY - startTouch.clientY)) > that.min_scroll) {
                                    buf.valid = true;
                                    buf.store["clientX"] = touch.clientX;
                                    buf.store["clientY"] = touch.clientY;
                                }
                                break;
                            case "tap":
                                if (Math.max(Math.abs(touch.clientX - startTouch.clientX), Math.abs(touch.clientY - startTouch.clientY)) > that.min_scroll) {
                                    buf.valid = false;
                                }
                                break;
                        }
                    }
                }
            }
        }, {
            capture: true,
            passive: true
        });

        // End touch
        document.addEventListener("touchend", function (event) {
            for (const touch of event.changedTouches) {
                const id = touch.identifier;
                console.log("End", id)
                for (const buf of [...that.touchBuf]) {
                    if (id == buf.id) {
                        const action = buf.action;
                        const target = buf.target;
                        const startTouch = buf.event;
                        const interaction = buf.interaction;
                        const target_key = buf.target_key;
                        const cb = buf.callback;
                        switch (action) {
                            case "scroll":
                                that.touchBuf.pop(buf);
                                if (buf.valid == true) {
                                    //cb(action, target, { x: touch.clientX - buf.store.clientX, y: touch.store.clientY - buf.store.clientY }, startTouch);
                                }

                                break;
                            case "tap":
                                that.touchBuf.pop(buf);
                                if (event.target.closest(target_key) == target && buf.valid == true) {
                                    cb(action, target, event);
                                }
                                break;
                        }
                    }
                }
            }
        });

        document.addEventListener("touchcancel", function (event) {
            for (const touch of event.changedTouches) {
                const id = touch.identifier;
                for (const buf of [...that.touchBuf]) {
                    if (id == buf.id) {
                        const action = buf.action;
                        const target = buf.target;
                        const startTouch = buf.event;
                        const interaction = buf.interaction;
                        const cb = interaction.callback;
                        switch (action) {
                            case "scroll":
                                that.touchBuf.pop(buf);
                                cb("scroll-cancel", target, { x: event.clientX - startTouch.clientX, y: event.clientY - startTouch.clientY }, startTouch);
                                break;
                            case "tap":
                                that.touchBuf.pop(buf);
                                break;
                        }
                    }
                }
            }
        });

        if (this.only_touch == false) {
            document.addEventListener('mousedown', function (event) {
                const touch = event;
                for (const interaction of that.interactions) {
                    const key = interaction[0]
                    const action = interaction[1];
                    const callback = interaction[2];
                    const target = event.target.closest(key);
                    if (target) {
                        var state = 'new'
                        const id = -1;
                        for (const buf of that.touchBuf) {
                            if (id == buf.id && action == buf.action && target == buf.target) {
                                switch (action) {
                                    case "scroll":
                                        buf.valid = false;
                                        buf.target = target;
                                        break;
                                    case "tap":
                                        buf.valid = true;
                                        buf.target = target;
                                        break;
                                }
                                state = 'modify'
                            }
                        }
                        if (state == 'new') {
                            console.log("Start", id)
                            switch (action) {
                                case "scroll":
                                    that.touchBuf.push({ "id": id, "action": action, "target": target, "target_key": key, "callback": callback, "event": touch, "store": {}, "valid": false });
                                    break;
                                case "tap":
                                    that.touchBuf.push({ "id": id, "action": action, "target": target, "target_key": key, "callback": callback, "event": touch, "store": {}, "valid": true });
                                    break;
                            }
                        }
                    }
                }
            });

            document.addEventListener('mousemove', function (event) {
                const touch = event;
                const id = -1;
                for (const buf of that.touchBuf) {
                    if (id == buf.id) {
                        const action = buf.action;
                        const target = buf.target;
                        const startTouch = buf.event;
                        const interaction = buf.interaction;
                        const cb = buf.callback;
                        switch (action) {
                            case "scroll":
                                if (buf.valid == true) {
                                    cb(action, target, { x: touch.clientX - buf.store.clientX, y: touch.clientY - buf.store.clientY }, startTouch);
                                    buf.store["clientX"] = touch.clientX;
                                    buf.store["clientY"] = touch.clientY;
                                } else if (Math.max(Math.abs(touch.clientX - startTouch.clientX), Math.abs(touch.clientY - startTouch.clientY)) > that.min_scroll) {
                                    buf.valid = true;
                                    buf.store["clientX"] = touch.clientX;
                                    buf.store["clientY"] = touch.clientY;
                                }
                                break;
                            case "tap":
                                if (Math.max(Math.abs(touch.clientX - startTouch.clientX), Math.abs(touch.clientY - startTouch.clientY)) > that.min_scroll) {
                                    buf.valid = false;
                                }
                                break;
                        }
                    }
                }

            }, {
                capture: true,
                passive: true
            });

            document.addEventListener('mouseup', function (event) {
                const touch = event;
                const id = -1;
                console.log("End", id)
                for (const buf of [...that.touchBuf]) {
                    if (id == buf.id) {
                        const action = buf.action;
                        const target = buf.target;
                        const startTouch = buf.event;
                        const interaction = buf.interaction;
                        const target_key = buf.target_key;
                        const cb = buf.callback;
                        switch (action) {
                            case "scroll":
                                that.touchBuf.pop(buf);
                                if (buf.valid == true) {
                                    //cb(action, target, { x: touch.clientX - buf.store.clientX, y: touch.store.clientY - buf.store.clientY }, startTouch);
                                }

                                break;
                            case "tap":
                                that.touchBuf.pop(buf);
                                if (event.target.closest(target_key) == target && buf.valid == true) {
                                    cb(action, target, event);
                                }
                                break;
                        }
                    }
                }
            });
        }

        return this;
    }

    addScroll(element, callback) {
        const el = [element, 'scroll', callback];
        for (const buf of this.touchBuf) {
            if (this.compareArrays(buf, el)) {
                return
            }
        }
        this.interactions.push(el);
    }

    addTap(element, callback) {
        const el = [element, 'tap', callback];
        for (const buf of this.touchBuf) {
            if (this.compareArrays(buf, el)) {
                return
            }
        }
        this.interactions.push(el);
    }
}

export const touchHandler = new MultiTouchHandler(20, 250, false).initialize();