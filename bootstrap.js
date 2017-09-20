"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

function clean_IndexedDB() {
    var stord = Services.dirsvc.get("ProfD", Ci.nsIFile);
    stord.append("storage");
    if (stord.exists() && stord.isDirectory) {
        var doms = {};
        for (var stor of ["default", "permanent", "temporary"]) {
            var storsubd = stord.clone();
            storsubd.append(stor);
            if (storsubd.exists() && storsubd.isDirectory) {
                var entries = storsubd.directoryEntries;
                while(entries.hasMoreElements()) {
                    var host, entry = entries.getNext();
                    entry.QueryInterface(Ci.nsIFile);
                    if ((host = /^(https?)\+\+\+(.+)$/.exec(entry.leafName)) !== null) {
                        doms[host[1] + "://" + host[2]] = true;
                    }
                }
            }
        }
    }
    var qm = Cc["@mozilla.org/dom/quota/manager;1"].getService(Ci.nsIQuotaManager);
    for (var dom in doms) {
        var uri = Services.io.newURI(dom, null, null);
        qm.clearStoragesForURI(uri);
    }
}

function startup(data, reason) {}

function shutdown(data, reason) {
    if (reason == APP_SHUTDOWN) {
        clean_IndexedDB();
    }
}

function install() {};
function uninstall() {};
