// loopxy.js v1
//
//  __   _____ _____ ____ _  _ _  _     ____ ___
// (  ) (  _  (  _  (  _ ( \/ ( \/ )   (_  _/ __)
//  )(__ )(_)( )(_)( )___/)  ( \  /   .-_)( \__ \
// (____(_____(_____(__) (_/\_)(__)   \____)(___/
//                             by elsa de alfonso
//
//
//               ~ Main goal ~
//
//  jQuery plugin to create a XY PSEUDO-INFINITE 
//          experience with animations 
//            and interaction effects
//
//                                Barcelona, 2021


(function ( $ ) {

    $.fn.loopXY = function(options) {

        // ::::::::::::::::::::::::::::::::::::::::::::::
        // DEFAULT SETTINGS
        // ::::::::::::::::::::::::::::::::::::::::::::::

        var settings = $.extend({

            // number of necessary replicas to cover viewport
            Y_REPLICAS: 1,
            X_REPLICAS: 1,

            // cursor movement effect quantity
            CURSOR_FACTOR: 35,

            // image movement normal speed (mPX / animation timestep)
            DX: 0,
            DY: 400,

            // image movement speeddown due to image hover
            SLOWDOWN_FACTOR: 0.4, // factor
            SLOWDOWN_DURATION: 300, // ms
            SPEEDUP_DURATION: 1000, // ms

            // autoscroll options
            autoScroll: false,
            autoScrollEdgeSize: 150,
            autoScrollMaxStep: 5,

            // selectors
            layoutSelector: '.loopxy',
            hoverEffectSelector: '.image'

        }, options );


        // ::::::::::::::::::::::::::::::::::::::::::::::
        // VARIABLE AND AUX FUNCTIONS
        // ::::::::::::::::::::::::::::::::::::::::::::::

        // identification of dom elements
        var $target = $(settings.layoutSelector);
        var target;
        var $main = $target.parent();
        $main.attr('id', "loopxy-container");
        var main = document.getElementById('loopxy-container');

        // initialization of vars
        var cursorPosX = 0; // so that we don't see the end of the container in any case
        var cursorPosY = 0;  
        var mouseDown = false;
        var mouseOnMove = false;
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var posX = 0;
        var posY = 0;
        var dX, dY;
        var targetX, targetY, mainX, mainY;
        var topLim, rightLim, botLim, leftLim;

        // autoscroll vars
        var isInLeftEdge = false;
        var isInRightEdge = false;
        var isInTopEdge = false;
        var isInBottomEdge = false;
        var viewportX;
        var viewportY;
        var cursorX = 0;
        var cursorY = 0;
        var lastcursorPosX, lastcursorPosY;
        var firstCursorMovement = true;
        var edgeTop;
        var edgeLeft;
        var edgeBottom;
        var edgeRight;

        function isTouchDevice() {
            return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
        };
        
        let isIOS = /iPad|iPhone|iPod/.test(navigator.platform) 
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        function pixelToEm(pixel) {
            return pixel / parseFloat($target.css('font-size'));
        }
        
        function checkLim(v, min, max) {
            const range = max - min;
            if (v >= max) {
                return v - range;
            } else if (v < min) {
                return v + range;
            } else return v;
        }



        // ::::::::::::::::::::::::::::::::::::::::::::::
        // INIT
        // ::::::::::::::::::::::::::::::::::::::::::::::

        this.init = function() {

            // replication of layout and css add
            createReplicas();

            // ADD CSS
            createCSS();

            // INITIAL SCROLL ANIMATION
            initialScroll();

            // LAYOUT MAIN ANIMATION AND INIFINITE SCROLL
            function repeatOften() {
                updateLoopxy();
                requestAnimationFrame(repeatOften);
            }
            requestAnimationFrame(repeatOften);

            // ADD MOVEMENT SPEED CHANGE ON HOVER THUMBNAILS
            if (!isTouchDevice()) {
                $(settings.hoverEffectSelector).hover(function(){

                    // slowdown on hover
                    $({ t: 0 }).animate({ t: 10}, {
                        duration: settings.SLOWDOWN_DURATION,
                        step: function(current, fx) {
                            dX = settings.DX * ( 1 - current * ( 1 - settings.SLOWDOWN_FACTOR ) / 10 );
                            dY = settings.DY * ( 1 - current * ( 1 - settings.SLOWDOWN_FACTOR ) / 10 );
                        }
                    });

                    }, function(){

                    // speedup when leaving hover
                    $({ t: 0 }).animate({ t: 10}, {
                        duration: settings.SPEEDUP_DURATION,
                        step: function(current, fx) {
                            dX = settings.DX * ( settings.SLOWDOWN_FACTOR + current * ( 1 - settings.SLOWDOWN_FACTOR ) / 10 );
                            dY = settings.DY * ( settings.SLOWDOWN_FACTOR + current * ( 1 - settings.SLOWDOWN_FACTOR ) / 10 );
                        }
                    });
                });
            }
            
            // ADD DRAGGABLE CAPABILITY TO LAYOUT
            if (!isTouchDevice()) {
                dragLoopXY();
            }

            // AUTO SCROLL ON EDGES
            if (!isTouchDevice()) {
                window.addEventListener( "mousemove", handleMousemove, false );
            };

        };


        // ::::::::::::::::::::::::::::::::::::::::::::::
        // MAIN FUNCTIONS
        // ::::::::::::::::::::::::::::::::::::::::::::::

        // CREATE REPLICAS
        // ------------------------------
        let createReplicas = function () {

            // create replicas
            const TOTAL_REPLICAS = (settings.Y_REPLICAS*2 + 1) * ( settings.X_REPLICAS*2 + 1);
            for (let i = 0; i < TOTAL_REPLICAS - 1; i++) {
                let replica = $main.children().first().clone();
                replica.each(function () {
                    $(this).attr('data-loopxy', `lxy_replica_${i}`);
                });
                $main.append(replica);
            }

            // recall original
            const ORIGINAL_POS = Math.floor(((settings.Y_REPLICAS + 1) * (settings.X_REPLICAS + 1)) / 2);
            main.children[ORIGINAL_POS].id = "the-original";
            target = document.getElementById("the-original");
            $target = $('#the-original');
        };
        
        // CREATE CSS
        // ------------------------------
        let createCSS = function() {
          
            var style = document.createElement("style");
            style.type = "text/css";
            style.id = "loopXYStyle";
            style.innerText = `
                #loopxy-container {
                    position: relative;
                    height: 100vh;
                    width: 100vw;
                    
                    display: grid;
                    grid-template-columns: repeat(${settings.X_REPLICAS*2 + 1}, 1fr);
                    grid-template-rows: repeat(${settings.Y_REPLICAS*2 + 1}, 1fr);

                    cursor: grab;

                    overflow: auto;
                    -webkit-overflow-scrolling: touch;
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: 0;  /* Firefox */
                    scrollbar-height: 0;  /* Firefox */          
                }

                #loopxy-container::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    heigth: 0;
                }
        
                .loopxy > * {
                    transition: transform 0.9s ease-out;
                    padding: 0;
                }
                body, html {
                    overflow: hidden;
                }
            `;

            document.head.appendChild(style);
                    
        };

        // LAYOUT CALCULATION
        // ------------------------------
        function calcLayout() {

            targetX = $target.width();
            targetY = $target.height();

            mainX = targetX * ( settings.X_REPLICAS * 2 + 1 );
            mainY = targetY * ( settings.Y_REPLICAS * 2 + 1 );

            topLim = (mainY - targetY) / 2;
            rightLim = (mainX + targetX) / 2;
            botLim = (mainY + targetY) / 2;
            leftLim = (mainX - targetX) / 2;
        }

        // INITIAL SCROLL
        // ------------------------------
        function initialScroll() {

            calcLayout();

            let nX = settings.X_REPLICAS*2 + 1;
            let nY = settings.Y_REPLICAS*2 + 1

            if (!isIOS) {

                var initialPosX = mainX/nX + targetX/2 - window.innerWidth/2;
                var initialPosY = mainY/nY + targetY/2 - window.innerHeight/2;

                $main.animate({
                    scrollTop: initialPosY - targetX/2.5, // X on pupose
                    scrollLeft: initialPosX - targetX/2
                }, 0, 'swing');

                $('body').css('opacity','1'); 

                $main.animate({
                    scrollTop: initialPosY,
                    scrollLeft: initialPosX
                }, 3000, 'swing');

            } else {

                var initialPosX = 5*mainX + targetX/2 - window.innerWidth/2;
                var initialPosY = 5*mainY + targetY/2 - window.innerHeight/2;

                $main.animate({
                    scrollTop: initialPosY - targetX/2.5, // adjust this as you desire
                    scrollLeft: initialPosX - targetX/2
                }, 3000, 'swing');

                setTimeout(function() {
                    $('body').css('opacity','1'); 
                },3000);

                $main.animate({
                    scrollTop: initialPosY + 0.33*targetY/nY, // adjust this as you desire
                    scrollLeft: initialPosX
                }, 3000, 'swing');
            
            }  

            dX = settings.DX;
            dY = settings.DY;

            console.log(" ");
            console.log("loopxy.js  ~  initial layout dimensions");
            console.log("---------------------------------------");
            console.log(" ");
            console.log("Target dimensions (x, y)", Math.floor(targetX), Math.floor(targetY));
            console.log("Main container dimensions (x, y)", Math.floor(mainX), Math.floor(mainY));
            console.log("Scroll limits (top, right, bottom, left)", Math.floor(topLim), Math.floor(rightLim), Math.floor(botLim), Math.floor(leftLim));
            console.log(" ");

        }

        // MAIN ANIMAITON
        // --------------
        function updateLoopxy() {

            // recalc layout sizes (in case of screen resize)
            calcLayout();

            let correctX = 0;
            let correctY = 0;

            if (!isTouchDevice()) {
                // replicas' children translation // mouse position organic effect
                cursorPosX -= cursorX * settings.CURSOR_FACTOR;
                cursorPosY -= cursorY * settings.CURSOR_FACTOR;
                cursorX = 0;
                cursorY = 0;

                // cursor grab 
                posX -= pos1
                posY -= pos2;
                pos1 = 0;
                pos2 = 0;
            }

            // correct scroll if out of limits
            if (!isIOS) {
                main.scrollLeft = checkLim(main.scrollLeft, leftLim, rightLim);
                main.scrollTop = checkLim(main.scrollTop, topLim, botLim);
            } else {
                correctX = ( Math.floor( main.scrollLeft / targetX ) - 1 ) * targetX;
                correctY = ( Math.floor( main.scrollTop / targetY ) - 1 ) * targetY;
            }

            // increase translate with constant movement
            posX += dX / 1000;
            posY += dY / 1000;
            
            //correct if limits are trespassed
            posX = checkLim(posX, 0, targetX);
            posY = checkLim(posY, 0, targetY);
            

            // autoscroll
            if (settings.autoScroll && !isTouchDevice && ( isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge )) {

                var intensityX = 0;
                var intensityY = 0;

                // Should we scroll left or right?
                if ( isInLeftEdge && !isInTopEdge ) {
                    intensityX = - ( edgeLeft - viewportX ) / settings.autoScrollEdgeSize;
                } else if ( isInRightEdge ) {
                    intensityX = ( viewportX - edgeRight ) / settings.autoScrollEdgeSize;
                }

                // Should we scroll up or down?
                if ( isInTopEdge && !isInLeftEdge ) {
                    intensityY = - ( edgeTop - viewportY ) / settings.autoScrollEdgeSize;
                } else if ( isInBottomEdge ) {
                    intensityY = ( viewportY - edgeBottom ) / settings.autoScrollEdgeSize;
                }

                posX -= settings.autoScrollMaxStep * intensityX;// + dX / 1000;
                posY -= settings.autoScrollMaxStep * intensityY;// + dY / 1000;
            }

            $main.children().css("transform", "translate(" + pixelToEm(posX + correctX) + "em, " + pixelToEm(posY + correctY) + "em)");

            if (!isTouchDevice()) {
                $main.children().children().css("transform", "translate(" + pixelToEm(cursorPosX) + "em, " + pixelToEm(cursorPosY) + "em)");
            }

            // document.getElementById('test-display').innerHTML = `
            //   orig X - ${Math.floor(targetX)}<br>
            //   orig Y - ${Math.floor(targetY)}<br>
            //   all replicas X - ${Math.floor(mainX)}<br>
            //   all replicas Y - ${Math.floor(mainY)}<br>
            //   scroll Left - ${Math.floor(main.scrollLeft)}<br>
            //   scroll Top - ${Math.floor(main.scrollTop)}<br>
            //   top Lim - ${Math.floor(topLim)}<br>
            //   bot Lim - ${Math.floor(botLim)}<br>
            //   pos X - ${Math.floor(posY)}`;

        };

        // DRAGGABLE LAYOUT
        // ------------------------------
        function dragLoopXY() {

            let dragArea = main;
            let $dragArea = $main;
          
            dragElement(dragArea);
          
            function dragElement(elmnt) {
                pos1 = 0;
                pos2 = 0;
                pos3 = 0; 
                pos4 = 0;
            
                elmnt.onmousedown = dragMouseDown;
            
                function dragMouseDown(e) {
            
                    $dragArea.css('cursor','grabbing');
                    mouseDown = true;
            
                    e = e || window.event;
                    e.preventDefault();
            
                    // get the mouse cursor position at startup:
                    pos3 = e.clientX;
                    pos4 = e.clientY;
            
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                }
            
                function elementDrag(e) {
            
                    mouseOnMove = true; 
            
                    e = e || window.event;
                    e.preventDefault();
            
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                }
            
                function closeDragElement() {
            
                    $dragArea.css('cursor','grab');
                    mouseDown = false;
                    setTimeout(function() { mouseOnMove = false; }, 300);
            
                    /* stop moving when mouse button is released:*/
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            }
        };

        // AUTO SCROLL ON EDGES
        // ------------------------------
        function handleMousemove( event ) {

            viewportX = event.clientX;
            viewportY = event.clientY;
          
            if (firstCursorMovement) {
                lastcursorPosX = viewportX;
                lastcursorPosY = viewportY;
                firstCursorMovement = false;
            };
          
            var viewportWidth = document.documentElement.clientWidth;
            var viewportHeight = document.documentElement.clientHeight;
          
            cursorX = (viewportX - lastcursorPosX) / viewportWidth;
            cursorY = (viewportY - lastcursorPosY) / viewportHeight;
          
            lastcursorPosX = viewportX;
            lastcursorPosY = viewportY;
          
            if (settings.autoScroll) {
                edgeTop = settings.autoScrollEdgeSize;
                edgeLeft = settings.autoScrollEdgeSize;
                edgeBottom = ( viewportHeight - settings.autoScrollEdgeSize );
                edgeRight = ( viewportWidth - settings.autoScrollEdgeSize );
            
                isInLeftEdge = ( viewportX < edgeLeft );
                isInRightEdge = ( viewportX > edgeRight );
                isInTopEdge = ( viewportY < edgeTop );
                isInBottomEdge = ( viewportY > edgeBottom );
            }
        };

        return this.init();

    }    

}( jQuery ));
