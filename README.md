# loopXY
jQuery plugin to create a XY PSEUDO-INFINITE experience with animations and interaction effects

Instructions
------------

- Add script to your HTML file after jQuery and before the script where you initialize it.
- Initialize plugin with command:

          $(window).loopXY();
          
- Optionally you can differ the defaults by introducing new values in the initialization. Current default values are:

          $(window).loopXY({

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

        });
