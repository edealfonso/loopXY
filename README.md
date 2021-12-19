# loopxy.js


Description
------------

jQuery plugin to create a XY PSEUDO-INFINITE experience with animations and interaction effects (detailed below). In order to do this, the plugin creates replicas of the layout. The plugin is compatible with responsive layouts. 

### Version history
- 1.0 First version (MIT License), made in Barcelona in December 2021



Instructions
------------

- Add script to your HTML file after jQuery and before the script where you initialize it.
- Initialize plugin with command:

          $(window).loopXY();
          
- The layout element must have class "loopxy" and must be inside a container. Example:

          <body>
            <div class="container">
              <div class="wrapper loopxy">

                <!-- Layout content goes here -->

              </div>
            </div>
          </body>
          
- Optionally you can differ the defaults by introducing new values in the initialization. Current default values are:

          $(window).loopXY({

            // number of necessary replicas to cover viewport
            Y_REPLICAS: 1,
            X_REPLICAS: 1,

            // constant layout movement (mPX / animation timestep)
            DX: 0,
            DY: 400,

            // image movement speeddown due to image hover
            SLOWDOWN_FACTOR: 0.4, // factor
            SLOWDOWN_DURATION: 300, // ms
            SPEEDUP_DURATION: 1000, // ms
            
            // cursor movement effect quantity
            CURSOR_FACTOR: 35,

            // autoscroll options
            autoScroll: false,
            autoScrollEdgeSize: 150,
            autoScrollMaxStep: 5,

            // selectors
            layoutSelector: '.loopxy',
            hoverEffectSelector: '.image'

        });
        
        
        
Animation and interaction description
-------------------------------------

- User can scroll the layout infinitelly in X and Y direction. *(The only exception is for iOS, where left-top direction reaches an end after scrolling 5 times the layout.)*
- The layout is in constant movement, set by `DX` and `DY`.
- That movement is altered as specified in `SLOWDOWN_FACTOR`, `SLOWDOWN_DURATION` and `SPEEDUP_DURATION` when hovering elements selected in `hoverEffectSelector`.
- Cursor movement makes the layout move slightly
- Autoscroll in the edges of the movement can be activated with `autoScroll` option. This effect is based on: https://bennadel.github.io/JavaScript-Demos/demos/window-edge-scrolling/
- The layout is also draggable with mouse.



Credits
-------

Developed by Elsa de Alfonso (elsa.de.alfonso@gmail.com), from an idea of Miguel Angel Álvarez (maalvarezluque@gmail.com). Feel free to contact me for suggestions or participation. 

Autoscroll in the edges of the window effect is based on: https://bennadel.github.io/JavaScript-Demos/demos/window-edge-scrolling/

**Please consider donating if you use it: 
https://www.paypal.com/donate/?business=9TUCX93RCG4NG&no_recurring=0&currency_code=EUR**



Next Steps
----------

- Do not require placing the layout in a container
- Set options to allow user to determine initial scroll position (now set to layout center)

