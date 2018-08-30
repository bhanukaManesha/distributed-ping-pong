"use strict";
function mousePosEvents() {
    const pos = document.getElementById("pos");
    document.addEventListener("mousemove", e => {
        const p = e.clientX + ', ' + e.clientY;
        pos.innerHTML = p;
        if (e.clientX > 400) {
            pos.classList.add('highlight');
        }
        else {
            pos.classList.remove('highlight');
        }
    });
}
function mousePosObservable() {
    const pos = document.getElementById("pos"), o = Observable
        .fromEvent(document, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
    o.map(({ x, y }) => `${x},${y}`)
        .subscribe(s => pos.innerHTML = s);
    o.filter(({ x }) => x > 400)
        .subscribe(_ => pos.classList.add('highlight'));
    o.filter(({ x }) => x <= 400)
        .subscribe(_ => pos.classList.remove('highlight'));
}
function animatedRectTimer() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    const animate = setInterval(() => rect.attr('x', 1 + Number(rect.attr('x'))), 10);
    const timer = setInterval(() => {
        clearInterval(animate);
        clearInterval(timer);
    }, 1000);
}
function animatedRect() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    Observable.interval(10)
        .takeUntil(Observable.interval(1000))
        .subscribe(() => rect.attr('x', 1 + Number(rect.attr('x'))));
}
function dragRectEvents() {
    const svg = document.getElementById("dragRect"), { left, top } = svg.getBoundingClientRect();
    const rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    rect.elem.addEventListener('mousedown', ((e) => {
        const xOffset = Number(rect.attr('x')) - e.clientX, yOffset = Number(rect.attr('y')) - e.clientY, moveListener = (e) => {
            rect
                .attr('x', e.clientX + xOffset)
                .attr('y', e.clientY + yOffset);
        }, done = () => {
            svg.removeEventListener('mousemove', moveListener);
        };
        svg.addEventListener('mousemove', moveListener);
        svg.addEventListener('mouseup', done);
        svg.addEventListener('mouseout', done);
    }));
}
function dragRectObservable() {
    const svg = document.getElementById("dragRect"), mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup'), rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    rect.observe('mousedown')
        .map(({ clientX, clientY }) => ({ xOffset: Number(rect.attr('x')) - clientX,
        yOffset: Number(rect.attr('y')) - clientY }))
        .flatMap(({ xOffset, yOffset }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => ({ x: clientX + xOffset, y: clientY + yOffset })))
        .subscribe(({ x, y }) => rect.attr('x', x)
        .attr('y', y));
}
function drawRectsEvents() {
    const svg = document.getElementById("drawRects");
    svg.addEventListener('mousedown', e => {
        const svgRect = svg.getBoundingClientRect(), x0 = e.clientX - svgRect.left, y0 = e.clientY - svgRect.top, rect = new Elem(svg, 'rect')
            .attr('x', String(x0))
            .attr('y', String(y0))
            .attr('width', '5')
            .attr('height', '5')
            .attr('fill', '#95B3D7');
        function moveListener(e) {
            const x1 = e.clientX - svgRect.left, y1 = e.clientY - svgRect.top, left = Math.min(x0, x1), top = Math.min(y0, y1), width = Math.abs(x0 - x1), height = Math.abs(y0 - y1);
            rect.attr('x', String(left))
                .attr('y', String(top))
                .attr('width', String(width))
                .attr('height', String(height));
        }
        function cleanup() {
            svg.removeEventListener('mousemove', moveListener);
            svg.removeEventListener('mouseup', cleanup);
        }
        svg.addEventListener('mouseup', cleanup);
        svg.addEventListener('mousemove', moveListener);
    });
}
function drawRectsObservable() {
    const svg = document.getElementById("drawRects"), mousedown = Observable.fromEvent(svg, 'mousedown').map(({ clientX, clientY }) => ({ x: clientX, y: clientY })), mousemove = Observable.fromEvent(svg, 'mousemove').map(({ clientX, clientY }) => ({ clientX: clientX, clientY: clientY })), mouseup = Observable.fromEvent(document, 'mouseup');
    mousedown.map(({ x, y }) => ({ x: x - svg.getBoundingClientRect().left, y: y - svg.getBoundingClientRect().top }))
        .map(({ x, y }) => new Elem(svg, 'rect')
        .attr('x', String(x))
        .attr('y', String(y))
        .attr('width', '1')
        .attr('height', '1')
        .attr("display", "none")
        .attr('fill', '#95B3D7'))
        .map(s => ({ element: s, x: Number(s.attr("x")), y: Number(s.attr("y")) }))
        .flatMap(({ element, x, y }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => ({
        clientX: clientX - svg.getBoundingClientRect().left,
        clientY: clientY - svg.getBoundingClientRect().top
    }))
        .map(({ clientX, clientY }) => ({ left: Math.min(x, clientX),
        width: Math.abs(x - clientX),
        top: Math.min(y, clientY),
        height: Math.abs(y - clientY),
        element: element
    })))
        .subscribe(({ left, width, top, height, element }) => element
        .attr('x', String(left))
        .attr('y', String(top))
        .attr('width', String(width))
        .attr('height', String(height))
        .attr("display", "block"));
}
function drawAndDragRectsObservable() {
    const draw = (svg) => {
        const mousedown = Observable.fromEvent(svg, 'mousedown'), mousemove = Observable.fromEvent(svg, 'mousemove').map(({ clientX, clientY }) => ({ clientX: clientX, clientY: clientY })), mouseup = Observable.fromEvent(document, 'mouseup');
        return mousedown
            .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))
            .map(({ x, y }) => ({ x: x - svg.getBoundingClientRect().left, y: y - svg.getBoundingClientRect().top }))
            .map(({ x, y }) => new Elem(svg, 'rect')
            .attr('x', String(x))
            .attr('y', String(y))
            .attr('width', '1')
            .attr('height', '1')
            .attr("dsiplay", "None")
            .attr('fill', '#95B3D7'))
            .map(s => ({ element: s, x: Number(s.attr("x")), y: Number(s.attr("y")) }))
            .flatMap(({ element, x, y }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({ clientX: clientX - svg.getBoundingClientRect().left,
            clientY: clientY - svg.getBoundingClientRect().top }))
            .map(({ clientX, clientY }) => ({ left: Math.min(x, clientX),
            width: Math.abs(x - clientX),
            top: Math.min(y, clientY),
            height: Math.abs(y - clientY),
            element: element
        })))
            .map(({ left, width, top, height, element }) => {
            return element
                .attr('x', String(left))
                .attr('y', String(top))
                .attr('width', String(width))
                .attr('height', String(height))
                .attr("display", "block");
        });
    };
    const drag = (svg) => (element) => {
        const mousemove = Observable.fromEvent(svg, 'mousemove').map(({ clientX, clientY }) => ({ clientX: clientX, clientY: clientY })), mouseup = Observable.fromEvent(document, 'mouseup');
        element.observe('mousedown').map(function (event) {
            event.stopPropagation();
            return event;
        })
            .map(({ clientX, clientY }) => ({ xOffset: Number(element.attr('x')) - clientX,
            yOffset: Number(element.attr('y')) - clientY }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({ x: clientX + xOffset, y: clientY + yOffset })))
            .subscribe(({ x, y }) => element.attr('x', x)
            .attr('y', y));
    };
    const svg = document.getElementById("drawAndDragRects");
    draw(svg).map(drag(svg)).subscribe(() => console.log("done"));
}
if (typeof window != 'undefined')
    window.onload = () => {
        mousePosObservable();
        animatedRect();
        dragRectObservable();
        drawRectsObservable();
        drawAndDragRectsObservable();
    };
//# sourceMappingURL=basicexamples.js.map