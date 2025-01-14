/** Copyright Stewart Allen <sa@grid.space> -- All Rights Reserved */

"use strict";

(function() {

    const KIRI = self.kiri,
        BASE = self.base,
        UTIL = BASE.util,
        POLY = BASE.polygons,
        FDM = KIRI.driver.FDM = {
            // init,           // src/mode/fdm/client.js
            // slice,          // src/mode/fdm/slice.js
            // prepare,        // src/mode/fdm/prepare.js
            // export,         // src/mode/fdm/export.js
            getRangeParameters
        };

    function getRangeParameters(process, index) {
        if (index === undefined || index === null || index < 0) {
            return process;
        }
        let ranges = process.ranges;
        if (!(ranges && ranges.length)) {
            return process;
        }
        let params = Object.clone(process);
        for (let range of ranges) {
            if (index >= range.lo && index <= range.hi) {
                for (let [key,value] of Object.entries(range.fields)) {
                    params[key] = value;
                    params._range = true;
                }
            }
        }
        return params;
    }

    // defer loading until KIRI.client and KIRI.worker exist
    KIRI.loader.push(function(API) {

        if (KIRI.client)
        // FDM.support_generate = KIRI.client.fdm_support_generate = function(ondone) {
        FDM.support_generate = function(ondone) {
            KIRI.client.clear();
            KIRI.client.sync();
            let settings = API.conf.get();
            let widgets = API.widgets.map();
            KIRI.client.send("fdm_support_generate", { settings }, (gen) => {
                for (let g of gen) g.widget = widgets[g.id];
                ondone(gen);
            });
        };

        if (KIRI.worker)
        KIRI.worker.fdm_support_generate = function(data, send) {
            const { settings } = data;
            const widgets = Object.values(wcache);
            const fresh = widgets.filter(widget => FDM.supports(settings, widget));
            send.done(KIRI.codec.encode(fresh.map(widget => { return {
                id: widget.id,
                supports: widget.supports,
            } } )));
        };

    });

})();
