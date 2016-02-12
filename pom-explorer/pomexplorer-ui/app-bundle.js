(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./Utils", "./tardigrades/Application"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Utils_1 = require("./Utils");
    var Application_1 = require("./tardigrades/Application");
    class ApplicationPanel {
        constructor() {
            this.template = Application_1.Application.create({});
            Utils_1.initMaterialElement(this.template.rootHtmlElement());
            this.template.menu().innerHTML = "";
        }
        addMenuHandler(handler) {
            var menu = this.template.menu();
            menu.addEventListener("click", (e) => {
                var target = e.target;
                let menuItemsIndex = this.template.menuItemsIndex(target);
                if (menuItemsIndex >= 0) {
                    let menuItem = this.template.menuItems(menuItemsIndex);
                    handler(menuItemsIndex, menuItem.innerText, e);
                    this.hideDrawer();
                }
            });
        }
        addMenuItem(name) {
            this.template.addMenuItems({ _root: name });
        }
        main() {
            return this.template.rootHtmlElement();
        }
        setContent(contentElement) {
            let content = this.template.content();
            content.innerHTML = "";
            if (contentElement != null)
                content.appendChild(contentElement);
        }
        hideDrawer() {
            // fix : the obfuscator is still visible if only remove is-visible from the drawer
            document.getElementsByClassName("mdl-layout__obfuscator")[0].classList.remove("is-visible");
            this.template.drawer().classList.remove("is-visible");
        }
    }
    exports.ApplicationPanel = ApplicationPanel;
});

},{"./Utils":6,"./tardigrades/Application":8}],2:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./tardigrades/ChangePanel"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ChangePanel_1 = require("./tardigrades/ChangePanel");
    class ChangePanel {
        constructor(service) {
            this.service = service;
            this.domlet = ChangePanel_1.ChangePanel.create({});
        }
        focus() {
            let rpcCall = {
                "service": "change",
                "method": "list",
                "parameters": {}
            };
            this.service.sendRpc(rpcCall, (message) => {
                var changes = JSON.parse(message.payload);
                this.domlet.graphChanges().innerHTML = changes.graphChanges.map(f => JSON.stringify(f)).join('<br/>');
                this.domlet.projectChanges().innerHTML = changes.projectChanges.map(f => JSON.stringify(f)).join('<br/>');
            });
        }
        element() {
            return this.domlet.rootHtmlElement();
        }
    }
    exports.ChangePanel = ChangePanel;
});

},{"./tardigrades/ChangePanel":12}],3:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./Utils", "./tardigrades/ConsolePanel"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Utils_1 = require("./Utils");
    var ConsolePanel_1 = require("./tardigrades/ConsolePanel");
    class ConsolePanel {
        constructor() {
            this.talks = {};
            this.currentHangout = null;
            this.domlet = ConsolePanel_1.ConsolePanel.create({});
            Utils_1.initMaterialElement(this.domlet.rootHtmlElement());
            this.initInput();
        }
        clear() {
            this.domlet.output().innerHTML = "";
        }
        input() {
            return this.domlet.input();
        }
        focus() {
            this.domlet.output().scrollTop = this.domlet.output().scrollHeight;
            this.input().focus();
        }
        element() {
            return this.domlet.rootHtmlElement();
        }
        initInput() {
            var history = [""];
            var historyIndex = 0;
            var input = this.input();
            input.onkeyup = e => {
                if (e.which === 13) {
                    var value = input.value;
                    this.oninput(value);
                    if (value != history[historyIndex]) {
                        history = history.slice(0, historyIndex + 1);
                        history.push(value);
                        historyIndex++;
                    }
                    input.select();
                    input.focus();
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (e.which === 38) {
                    var value = input.value;
                    if (value != history[historyIndex])
                        history.push(value);
                    historyIndex = Math.max(0, historyIndex - 1);
                    input.value = history[historyIndex];
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (e.which === 40) {
                    var value = input.value;
                    if (value != history[historyIndex])
                        history.push(value);
                    historyIndex = Math.min(historyIndex + 1, history.length - 1);
                    input.value = history[historyIndex];
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
        }
        print(message, talkId) {
            if (message == null)
                return;
            let output = this.domlet.output();
            var follow = (output.scrollHeight - output.scrollTop) <= output.clientHeight + 10;
            var talk = this.talks[talkId];
            if (!talk) {
                talk = document.createElement("div");
                talk.className = "talk";
                if (talkId === "buildPipelineStatus")
                    document.getElementById("buildPipelineStatus").appendChild(talk);
                else
                    output.appendChild(talk);
                this.talks[talkId] = talk;
                talk.innerHTML += "<div style='float:right;' onclick='killTalk(this)'>X</div>";
            }
            if (0 !== message.indexOf("<span") && 0 !== message.indexOf("<div"))
                message = `<div>${message}</div>`;
            if (talkId === "buildPipelineStatus")
                talk.innerHTML = `<div style='float:right;' onclick='killTalk(this)'>X</div>${message}`;
            else
                talk.insertAdjacentHTML("beforeend", message);
            if (follow)
                output.scrollTop = output.scrollHeight;
        }
    }
    exports.ConsolePanel = ConsolePanel;
});

},{"./Utils":6,"./tardigrades/ConsolePanel":13}],4:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./tardigrades/Card", "./tardigrades/ChangeGavCard", "./Utils", "./tardigrades/ProjectPanel", "./tardigrades/Popup"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Card_1 = require("./tardigrades/Card");
    var ChangeGavCard_1 = require("./tardigrades/ChangeGavCard");
    var Utils_1 = require("./Utils");
    var ProjectPanel_1 = require("./tardigrades/ProjectPanel");
    var Popup_1 = require("./tardigrades/Popup");
    class ProjectPanel {
        constructor(service) {
            this.service = service;
            this.domlet = ProjectPanel_1.ProjectPanel.create({});
            Utils_1.initMaterialElement(this.domlet.rootHtmlElement());
            this.domlet.projectList().addEventListener("click", event => {
                this.forDetailsToggle(event.target);
                this.forChangeGav(event.target);
            });
            this.domlet.projectList().addEventListener("dblclick", event => this.forChangeGav(event.target));
            Utils_1.rx.Observable.fromEvent(this.domlet.searchInput(), "input")
                .pluck("target", "value")
                .debounce(300)
                .distinctUntilChanged()
                .subscribe(value => {
                this.domlet.projectList().innerHTML = `<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>`;
                Utils_1.initMaterialElement(this.domlet.projectList().children[0]);
                let rpcCall = {
                    "service": "projects",
                    "method": "list",
                    "parameters": {
                        "query": value
                    }
                };
                this.service.sendRpc(rpcCall, (message) => {
                    var list = JSON.parse(message.payload);
                    var htmlString = "";
                    for (var pi in list) {
                        var project = list[pi];
                        let parts = project.gav.split(":");
                        let groupId = parts[0];
                        let artifactId = parts[1];
                        let version = parts[2];
                        var content = "";
                        if (project.buildable)
                            content += "<span class='badge'>buildable</span>";
                        content += `<span class='packaging'>${project.packaging}</span>`;
                        if (project.description)
                            content += project.description + "<br/><br/>";
                        if (project.parentChain && project.parentChain.length > 0)
                            content += `<i>parent${project.parentChain.length > 1 ? "s" : ""}</i><br/>${project.parentChain.join("<br/>")}<br/><br/>`;
                        if (project.file)
                            content += `<i>file</i><br/>${project.file}<br/><br/>`;
                        if (project.properties) {
                            var a = true;
                            for (var name in project.properties) {
                                if (a) {
                                    a = false;
                                    content += "<i>properties</i><br/>";
                                }
                                content += `${name}: <b>${project.properties[name]}</b><br/>`;
                            }
                            if (!a)
                                content += "<br/>";
                        }
                        if (project.references && project.references.length > 0) {
                            content += "<i>referenced by</i><br/>";
                            for (var ii = 0; ii < project.references.length; ii++) {
                                var ref = project.references[ii];
                                content += `${ref.gav} as ${ref.dependencyType}<br/>`;
                            }
                            content += "<br/>";
                        }
                        var details = "";
                        if (project.dependencyManagement) {
                            details += project.dependencyManagement;
                            details += "<br/>";
                        }
                        if (project.dependencies) {
                            details += project.dependencies;
                            details += "<br/>";
                        }
                        if (project.pluginManagement) {
                            details += project.pluginManagement;
                            details += "<br/>";
                        }
                        if (project.plugins) {
                            details += project.plugins;
                            details += "<br/>";
                        }
                        htmlString += Card_1.Card.html({
                            gav: { groupId: groupId, artifactId: artifactId, version: version },
                            content: content,
                            details: details
                        });
                    }
                    this.domlet.projectList().innerHTML = htmlString;
                    Utils_1.initMaterialElement(this.domlet.projectList());
                    let elements = this.domlet.projectList().children;
                    for (var pi in list) {
                        var project = list[pi];
                        Card_1.Card.of(elements.item(pi)).setUserData(project);
                    }
                });
            });
        }
        focus() {
            this.domlet.searchInput().focus();
        }
        element() {
            return this.domlet.rootHtmlElement();
        }
        forDetailsToggle(hitElement) {
            let card = this.domlet.cardsHitDomlet(hitElement);
            if (card == null)
                return;
            if (card.actionDetailsHit(hitElement)) {
                if (card.details().style.display === "none")
                    card.details().style.display = null;
                else
                    card.details().style.display = "none";
            }
        }
        forChangeGav(hitElement) {
            let card = this.domlet.cardsHitDomlet(hitElement);
            if (card == null)
                return;
            let project = card.getUserData();
            let parts = project.gav.split(":");
            let groupId = parts[0];
            let artifactId = parts[1];
            let version = parts[2];
            if (card.editHit(hitElement) || card.gavHit(hitElement)) {
                let changeCard = ChangeGavCard_1.ChangeGavCard.create({
                    groupId: groupId,
                    artifactId: artifactId,
                    version: version,
                    "@groupIdInput": { "value": groupId },
                    "@artifactIdInput": { "value": artifactId },
                    "@versionInput": { "value": version }
                });
                Utils_1.initMaterialElement(changeCard.rootHtmlElement());
                let popup = Popup_1.Popup.create({});
                popup.content().appendChild(changeCard.rootHtmlElement());
                document.getElementsByTagName('body')[0].appendChild(popup.rootHtmlElement());
                changeCard.rootHtmlElement().addEventListener("click", event => {
                    let test = changeCard.groupIdInput();
                    let hit = event.target;
                    if (changeCard.actionCancelHit(hit)) {
                        popup.rootHtmlElement().remove();
                    }
                    else if (changeCard.actionValidateHit(hit)) {
                        let rpcCall = {
                            "service": "gav",
                            "method": "change",
                            "parameters": {
                                "oldGav": project.gav,
                                "newGav": `${changeCard.groupIdInput().value}:${changeCard.artifactIdInput().value}:${changeCard.artifactIdInput().value}`
                            }
                        };
                        popup.rootHtmlElement().style.opacity = "0.5";
                        this.service.sendRpc(rpcCall, (message) => {
                            var result = JSON.parse(message.payload);
                            alert(message.payload);
                            // TODO : call service and manage results...
                            // this.service.
                            popup.rootHtmlElement().remove();
                        });
                    }
                });
            }
        }
    }
    exports.ProjectPanel = ProjectPanel;
});

},{"./Utils":6,"./tardigrades/Card":10,"./tardigrades/ChangeGavCard":11,"./tardigrades/Popup":15,"./tardigrades/ProjectPanel":16}],5:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    class Service {
        constructor() {
            this.waitingCallbacks = {};
        }
        connect() {
            this.socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);
            this.socket.onopen = () => this.onStatus(Status.Connected);
            this.socket.onerror = () => this.onStatus(Status.Error);
            this.socket.onclose = () => this.onStatus(Status.Disconnected);
            this.socket.onmessage = event => {
                var msg = JSON.parse(event.data);
                this.handleMessage(msg);
            };
        }
        sendRpc(rpcCall, callback) {
            var message = {
                guid: `message-${Math.random()}`,
                talkGuid: `talkGuid-${Math.random()}`,
                responseTo: null,
                isClosing: false,
                payloadFormat: "application/rpc",
                payload: JSON.stringify(rpcCall)
            };
            this.waitingCallbacks[message.talkGuid] = callback;
            this.socket.send(JSON.stringify(message));
        }
        sendTextCommand(talkId, command, callback) {
            var message = {
                guid: `message-${Math.random()}`,
                talkGuid: talkId,
                responseTo: null,
                isClosing: false,
                payloadFormat: "text/command",
                payload: command
            };
            this.waitingCallbacks[talkId] = callback;
            this.socket.send(JSON.stringify(message));
        }
        sendHangoutReply(guid, talkGuid, content) {
            var message = {
                guid: `message-${Math.random()}`,
                talkGuid: talkGuid,
                responseTo: guid,
                isClosing: false,
                payloadFormat: "hangout/reply",
                payload: content
            };
            this.socket.send(JSON.stringify(message));
        }
        handleMessage(msg) {
            var talkId = msg.talkGuid;
            var callback = this.waitingCallbacks[talkId];
            if (callback) {
                console.log(`received msg : ${JSON.stringify(msg)}`);
                callback(msg);
            }
            else {
                this.onUnknownMessage(msg);
            }
            if (msg.isClosing) {
                delete this.waitingCallbacks[talkId];
            }
        }
    }
    exports.Service = Service;
    ;
    (function (Status) {
        Status[Status["Connected"] = 0] = "Connected";
        Status[Status["Disconnected"] = 1] = "Disconnected";
        Status[Status["Error"] = 2] = "Error";
    })(exports.Status || (exports.Status = {}));
    var Status = exports.Status;
});

},{}],6:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.rx = Rx;
    function initMaterialElement(e) {
        if (e == null)
            return;
        var upgrade = false;
        for (var i = 0; i < e.classList.length; i++)
            if (e.classList[i].indexOf("mdl-") >= 0) {
                upgrade = true;
                break;
            }
        if (upgrade)
            componentHandler.upgradeElement(e);
        for (var c in e.children) {
            if (e.children[c] instanceof HTMLElement)
                initMaterialElement(e.children[c]);
        }
    }
    exports.initMaterialElement = initMaterialElement;
});

},{}],7:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./ApplicationPanel", "./ProjectPanel", "./ConsolePanel", "./ChangePanel", "./Service"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ApplicationPanel_1 = require("./ApplicationPanel");
    var ProjectPanel_1 = require("./ProjectPanel");
    var ConsolePanel_1 = require("./ConsolePanel");
    var ChangePanel_1 = require("./ChangePanel");
    var Service_1 = require("./Service");
    window.onload = () => {
        var panel = new ApplicationPanel_1.ApplicationPanel();
        document.getElementsByTagName("body")[0].innerHTML = "";
        document.getElementsByTagName("body")[0].appendChild(panel.main());
        var service = new Service_1.Service();
        var projectPanel = new ProjectPanel_1.ProjectPanel(service);
        var consolePanel = new ConsolePanel_1.ConsolePanel();
        let changesPanel = new ChangePanel_1.ChangePanel(service);
        panel.addMenuItem("Projects");
        panel.addMenuItem("Changes");
        panel.addMenuItem("Graph");
        panel.addMenuItem("Build");
        panel.addMenuItem("Console");
        let setPanel = (p) => {
            if (p) {
                panel.setContent(p.element());
                p.focus();
            }
            else {
                panel.setContent(null);
            }
        };
        panel.addMenuHandler((index, menuName, event) => {
            switch (menuName) {
                case "Projects":
                    setPanel(projectPanel);
                    break;
                case "Console":
                    setPanel(consolePanel);
                    break;
                case "Changes":
                    setPanel(changesPanel);
                    break;
                default:
                    setPanel(null);
            }
        });
        setPanel(consolePanel);
        service.onUnknownMessage = (message) => {
            consolePanel.print(message.payload, message.talkGuid);
        };
        service.onStatus = (status) => {
            switch (status) {
                case Service_1.Status.Connected:
                    consolePanel.print("connected to the server.", `ff${Math.random()}`);
                    break;
                case Service_1.Status.Error:
                    consolePanel.print("server communication error", `ff${Math.random()}`);
                    break;
                case Service_1.Status.Disconnected:
                    consolePanel.print("disconnected from server", `ff${Math.random()}`);
                    break;
                default:
            }
        };
        service.connect();
        consolePanel.oninput = function (userInput) {
            if (userInput === "cls" || userInput === "clear") {
                consolePanel.clear();
                return;
            }
            if (this.currentHangout == null) {
                var talkId = `command-${Math.random()}`;
                consolePanel.print(`<div class='entry'>${userInput}</div>`, talkId);
                service.sendTextCommand(talkId, userInput, (replyMessage) => {
                    if (replyMessage.payloadFormat === "html") {
                        consolePanel.print(replyMessage.payload, talkId);
                    }
                    else if (replyMessage.payloadFormat === "hangout/question") {
                        //consolePanel.input.placeholder = "question: " + msg.payload;
                        consolePanel.print(`question: ${replyMessage.payload}`, talkId);
                        consolePanel.currentHangout = replyMessage;
                    }
                });
            }
            else {
                this.currentHangout = null;
                service.sendHangoutReply(this.currentHangout.guid, this.currentHangout.talkGuid, userInput);
            }
        };
    };
});

},{"./ApplicationPanel":1,"./ChangePanel":2,"./ConsolePanel":3,"./ProjectPanel":4,"./Service":5}],8:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class Application {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (Application.loaded)
                return;
            Application.loaded = true;
            engine_1.tardigradeEngine.addTemplate("Application", new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-layout mdl-js-layout mdl-layout--fixed-header" }, [new model_1.ElementNode(null, 0, [""], "header", { "class": "mdl-layout__header" }, [new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-layout__header-row" }, [new model_1.ElementNode(null, 0, [""], "span", { "class": "mdl-layout-title" }, [new model_1.TextNode("Pom Explorer")]), new model_1.TextNode("&nbsp;&nbsp;&nbsp;&nbsp;"), new model_1.ElementNode(null, 0, [""], "span", { "class": "mdl-badge", "data-badge": "!" }, [new model_1.TextNode("beta")])])]), new model_1.ElementNode("drawer", 0, [""], "div", { "class": "mdl-layout__drawer" }, [new model_1.ElementNode(null, 0, [""], "span", { "class": "mdl-layout-title" }, [new model_1.TextNode("Pom Explorer")]), new model_1.ElementNode("menu", 0, [""], "nav", { "class": "mdl-navigation" }, [new model_1.ElementNode("menuItems", 1, [""], "a", { "class": "mdl-navigation__link", "href": "#" }, [])])]), new model_1.ElementNode("content", 0, [""], "main", { "class": "mdl-layout__content content-repositionning" }, [])]));
        }
        static html(dto) {
            Application.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("Application", dto);
        }
        static element(dto) {
            return runtime_1.createElement(Application.html(dto));
        }
        static create(dto) {
            let element = Application.element(dto);
            return new Application(element);
        }
        static of(element) {
            return new Application(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        drawer() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Application", { "drawer": 0 });
        }
        drawerHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Application", hitTest);
            return (location != null && ("drawer" in location));
        }
        menu() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Application", { "menu": 0 });
        }
        menuHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Application", hitTest);
            return (location != null && ("menu" in location));
        }
        menuItems(menuItemsIndex) {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Application", { "menuItems": menuItemsIndex });
        }
        menuItemsIndex(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Application", hitTest);
            if (location != null && ("menuItems" in location))
                return location["menuItems"];
            return -1;
        }
        buildMenuItems(dto) {
            return engine_1.tardigradeEngine.buildNodeHtml("Application", "menuItems", dto);
        }
        addMenuItems(dto) {
            let newItem = this.buildMenuItems(dto);
            let newElement = runtime_1.createElement(newItem);
            this.menu().appendChild(newElement);
            return newElement;
        }
        countMenuItems() {
            return this.menu().children.length;
        }
        content() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Application", { "content": 0 });
        }
        contentHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Application", hitTest);
            return (location != null && ("content" in location));
        }
    }
    Application.loaded = false;
    exports.Application = Application;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],9:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class BaseCard {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (BaseCard.loaded)
                return;
            BaseCard.loaded = true;
            engine_1.tardigradeEngine.addTemplate("BaseCard", new model_1.ElementNode(null, 0, [""], "div", { "class": "project-card mdl-card mdl-shadow--2dp" }, [new model_1.ElementNode("title", 0, [""], "div", { "class": "mdl-card__title mdl-card--expand" }, []), new model_1.ElementNode("content", 0, [""], "div", { "class": "mdl-card__supporting-text" }, []), new model_1.ElementNode("details", 0, [""], "div", { "class": "mdl-card__supporting-text", "style": "display:none;" }, []), new model_1.ElementNode("actions", 0, [""], "div", { "class": "mdl-card__actions mdl-card--border" }, []), new model_1.ElementNode("menu", 0, [""], "div", { "class": "mdl-card__menu" }, [])]));
        }
        static html(dto) {
            BaseCard.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("BaseCard", dto);
        }
        static element(dto) {
            return runtime_1.createElement(BaseCard.html(dto));
        }
        static create(dto) {
            let element = BaseCard.element(dto);
            return new BaseCard(element);
        }
        static of(element) {
            return new BaseCard(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        title() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "BaseCard", { "title": 0 });
        }
        titleHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "BaseCard", hitTest);
            return (location != null && ("title" in location));
        }
        content() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "BaseCard", { "content": 0 });
        }
        contentHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "BaseCard", hitTest);
            return (location != null && ("content" in location));
        }
        details() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "BaseCard", { "details": 0 });
        }
        detailsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "BaseCard", hitTest);
            return (location != null && ("details" in location));
        }
        actions() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "BaseCard", { "actions": 0 });
        }
        actionsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "BaseCard", hitTest);
            return (location != null && ("actions" in location));
        }
        menu() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "BaseCard", { "menu": 0 });
        }
        menuHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "BaseCard", hitTest);
            return (location != null && ("menu" in location));
        }
    }
    BaseCard.loaded = false;
    exports.BaseCard = BaseCard;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],10:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime", "./BaseCard", "./Gav"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    var BaseCard_1 = require("./BaseCard");
    var Gav_1 = require("./Gav");
    class Card {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (Card.loaded)
                return;
            Card.loaded = true;
            BaseCard_1.BaseCard.ensureLoaded();
            Gav_1.Gav.ensureLoaded();
            engine_1.tardigradeEngine.addTemplate("Card", new model_1.TemplateNode(null, 0, [""], "BaseCard", {}, { "title": new model_1.PointInfo(null, {}, [new model_1.TemplateNode("gav", 0, ["export"], "Gav", { "class": "mdl-card__title-text" }, { "groupId": new model_1.PointInfo("gavGroupId", {}, []), "artifactId": new model_1.PointInfo("gavArtifactId", {}, []), "version": new model_1.PointInfo("gavVersion", {}, []) })]), "content": new model_1.PointInfo("content", {}, []), "details": new model_1.PointInfo("details", {}, []), "actions": new model_1.PointInfo("actions", {}, [new model_1.ElementNode("actionDetails", 0, [""], "a", { "class": "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" }, [new model_1.TextNode("Details")]), new model_1.ElementNode("edit", 0, [""], "button", { "class": "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" }, [new model_1.ElementNode(null, 0, [""], "i", { "class": "material-icons" }, [new model_1.TextNode("mode_edit")])])]) }));
        }
        static html(dto) {
            Card.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("Card", dto);
        }
        static element(dto) {
            return runtime_1.createElement(Card.html(dto));
        }
        static create(dto) {
            let element = Card.element(dto);
            return new Card(element);
        }
        static of(element) {
            return new Card(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        gav() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "gav": 0 });
        }
        gavDomlet() {
            let element = this.gav();
            return Gav_1.Gav.of(element);
        }
        gavHitDomlet(hitElement) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitElement);
            if (location == null)
                return null;
            return this.gavDomlet();
        }
        gavHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("gav" in location));
        }
        gavGroupId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "gavGroupId": 0 });
        }
        gavGroupIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("gavGroupId" in location));
        }
        gavArtifactId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "gavArtifactId": 0 });
        }
        gavArtifactIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("gavArtifactId" in location));
        }
        gavVersion() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "gavVersion": 0 });
        }
        gavVersionHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("gavVersion" in location));
        }
        content() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "content": 0 });
        }
        contentHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("content" in location));
        }
        details() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "details": 0 });
        }
        detailsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("details" in location));
        }
        actions() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "actions": 0 });
        }
        actionsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("actions" in location));
        }
        actionDetails() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "actionDetails": 0 });
        }
        actionDetailsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("actionDetails" in location));
        }
        edit() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Card", { "edit": 0 });
        }
        editHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Card", hitTest);
            return (location != null && ("edit" in location));
        }
    }
    Card.loaded = false;
    exports.Card = Card;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20,"./BaseCard":9,"./Gav":14}],11:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime", "./BaseCard"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    var BaseCard_1 = require("./BaseCard");
    class ChangeGavCard {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (ChangeGavCard.loaded)
                return;
            ChangeGavCard.loaded = true;
            BaseCard_1.BaseCard.ensureLoaded();
            engine_1.tardigradeEngine.addTemplate("ChangeGavCard", new model_1.TemplateNode(null, 0, [""], "BaseCard", {}, { "title": new model_1.PointInfo(null, {}, [new model_1.TextNode("Changing&nbsp;"), new model_1.ElementNode("groupId", 0, [""], "span", {}, []), new model_1.TextNode(":"), new model_1.ElementNode("artifactId", 0, [""], "span", {}, []), new model_1.TextNode(":"), new model_1.ElementNode("version", 0, [""], "span", {}, [])]), "content": new model_1.PointInfo(null, {}, [new model_1.TextNode("You can change this GAV and all projects linked to it will be updated. By now,"), new model_1.ElementNode(null, 0, [""], "b", {}, [new model_1.TextNode("NO CHANGE IS APPLIED")]), new model_1.TextNode("until            you go in the Change tab and validate."), new model_1.ElementNode(null, 0, [""], "br", {}, []), new model_1.TextNode("Enter the new coordinates for this GAV :"), new model_1.ElementNode(null, 0, [""], "br", {}, []), new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-textfield mdl-js-textfield mdl-textfield--floating-label", "style": "display:block;" }, [new model_1.ElementNode("groupIdInput", 0, [""], "input", { "class": "mdl-textfield__input", "type": "text", "id": "groupId" }, []), new model_1.ElementNode(null, 0, [""], "label", { "class": "mdl-textfield__label", "for": "groupId" }, [new model_1.TextNode("groupId")])]), new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-textfield mdl-js-textfield mdl-textfield--floating-label", "style": "display:block;" }, [new model_1.ElementNode("artifactIdInput", 0, [""], "input", { "class": "mdl-textfield__input", "type": "text", "id": "artifactId" }, []), new model_1.ElementNode(null, 0, [""], "label", { "class": "mdl-textfield__label", "for": "artifactId" }, [new model_1.TextNode("artifactId")])]), new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-textfield mdl-js-textfield mdl-textfield--floating-label", "style": "display:block;" }, [new model_1.ElementNode("versionInput", 0, [""], "input", { "class": "mdl-textfield__input", "type": "text", "id": "version" }, []), new model_1.ElementNode(null, 0, [""], "label", { "class": "mdl-textfield__label", "for": "version" }, [new model_1.TextNode("version")])])]), "actions": new model_1.PointInfo("actions", {}, [new model_1.ElementNode("actionCancel", 0, [""], "a", { "class": "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" }, [new model_1.TextNode("Cancel")]), new model_1.ElementNode("actionValidate", 0, [""], "a", { "class": "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" }, [new model_1.TextNode("Ok, store the change")])]) }));
        }
        static html(dto) {
            ChangeGavCard.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("ChangeGavCard", dto);
        }
        static element(dto) {
            return runtime_1.createElement(ChangeGavCard.html(dto));
        }
        static create(dto) {
            let element = ChangeGavCard.element(dto);
            return new ChangeGavCard(element);
        }
        static of(element) {
            return new ChangeGavCard(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        groupId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "groupId": 0 });
        }
        groupIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("groupId" in location));
        }
        artifactId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "artifactId": 0 });
        }
        artifactIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("artifactId" in location));
        }
        version() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "version": 0 });
        }
        versionHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("version" in location));
        }
        groupIdInput() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "groupIdInput": 0 });
        }
        groupIdInputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("groupIdInput" in location));
        }
        artifactIdInput() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "artifactIdInput": 0 });
        }
        artifactIdInputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("artifactIdInput" in location));
        }
        versionInput() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "versionInput": 0 });
        }
        versionInputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("versionInput" in location));
        }
        actions() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "actions": 0 });
        }
        actionsHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("actions" in location));
        }
        actionCancel() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "actionCancel": 0 });
        }
        actionCancelHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("actionCancel" in location));
        }
        actionValidate() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangeGavCard", { "actionValidate": 0 });
        }
        actionValidateHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangeGavCard", hitTest);
            return (location != null && ("actionValidate" in location));
        }
    }
    ChangeGavCard.loaded = false;
    exports.ChangeGavCard = ChangeGavCard;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20,"./BaseCard":9}],12:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class ChangePanel {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (ChangePanel.loaded)
                return;
            ChangePanel.loaded = true;
            engine_1.tardigradeEngine.addTemplate("ChangePanel", new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.ElementNode(null, 0, [""], "h2", {}, [new model_1.TextNode("Graph changes")]), new model_1.ElementNode("graphChanges", 0, [""], "div", {}, [])]), new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.ElementNode(null, 0, [""], "h2", {}, [new model_1.TextNode("Project changes")]), new model_1.ElementNode("projectChanges", 0, [""], "div", {}, [])])]));
        }
        static html(dto) {
            ChangePanel.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("ChangePanel", dto);
        }
        static element(dto) {
            return runtime_1.createElement(ChangePanel.html(dto));
        }
        static create(dto) {
            let element = ChangePanel.element(dto);
            return new ChangePanel(element);
        }
        static of(element) {
            return new ChangePanel(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        graphChanges() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangePanel", { "graphChanges": 0 });
        }
        graphChangesHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangePanel", hitTest);
            return (location != null && ("graphChanges" in location));
        }
        projectChanges() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ChangePanel", { "projectChanges": 0 });
        }
        projectChangesHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ChangePanel", hitTest);
            return (location != null && ("projectChanges" in location));
        }
    }
    ChangePanel.loaded = false;
    exports.ChangePanel = ChangePanel;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],13:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class ConsolePanel {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (ConsolePanel.loaded)
                return;
            ConsolePanel.loaded = true;
            engine_1.tardigradeEngine.addTemplate("ConsolePanel", new model_1.ElementNode(null, 0, [""], "div", { "class": "console-panel" }, [new model_1.ElementNode("output", 0, [""], "div", { "class": "console-output" }, []), new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-textfield mdl-js-textfield mdl-textfield--floating-label" }, [new model_1.ElementNode("input", 0, [""], "input", { "class": "mdl-textfield__input", "type": "text", "id": "sample3" }, []), new model_1.ElementNode(null, 0, [""], "label", { "class": "mdl-textfield__label", "for": "sample3" }, [new model_1.TextNode("enter a command, or just \"?\" to get help")])])]));
        }
        static html(dto) {
            ConsolePanel.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("ConsolePanel", dto);
        }
        static element(dto) {
            return runtime_1.createElement(ConsolePanel.html(dto));
        }
        static create(dto) {
            let element = ConsolePanel.element(dto);
            return new ConsolePanel(element);
        }
        static of(element) {
            return new ConsolePanel(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        output() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ConsolePanel", { "output": 0 });
        }
        outputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ConsolePanel", hitTest);
            return (location != null && ("output" in location));
        }
        input() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ConsolePanel", { "input": 0 });
        }
        inputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ConsolePanel", hitTest);
            return (location != null && ("input" in location));
        }
    }
    ConsolePanel.loaded = false;
    exports.ConsolePanel = ConsolePanel;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],14:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class Gav {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (Gav.loaded)
                return;
            Gav.loaded = true;
            engine_1.tardigradeEngine.addTemplate("Gav", new model_1.ElementNode(null, 0, [""], "h2", { "class": "mdl-card__title-text" }, [new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.ElementNode("groupId", 0, [""], "div", {}, []), new model_1.ElementNode("artifactId", 0, [""], "div", {}, []), new model_1.ElementNode("version", 0, [""], "div", {}, [])])]));
        }
        static html(dto) {
            Gav.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("Gav", dto);
        }
        static element(dto) {
            return runtime_1.createElement(Gav.html(dto));
        }
        static create(dto) {
            let element = Gav.element(dto);
            return new Gav(element);
        }
        static of(element) {
            return new Gav(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        groupId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Gav", { "groupId": 0 });
        }
        groupIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Gav", hitTest);
            return (location != null && ("groupId" in location));
        }
        artifactId() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Gav", { "artifactId": 0 });
        }
        artifactIdHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Gav", hitTest);
            return (location != null && ("artifactId" in location));
        }
        version() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Gav", { "version": 0 });
        }
        versionHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Gav", hitTest);
            return (location != null && ("version" in location));
        }
    }
    Gav.loaded = false;
    exports.Gav = Gav;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],15:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class Popup {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (Popup.loaded)
                return;
            Popup.loaded = true;
            engine_1.tardigradeEngine.addTemplate("Popup", new model_1.ElementNode("content", 0, [""], "div", { "class": "Popup" }, []));
        }
        static html(dto) {
            Popup.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("Popup", dto);
        }
        static element(dto) {
            return runtime_1.createElement(Popup.html(dto));
        }
        static create(dto) {
            let element = Popup.element(dto);
            return new Popup(element);
        }
        static of(element) {
            return new Popup(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        content() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "Popup", { "content": 0 });
        }
        contentHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "Popup", hitTest);
            return (location != null && ("content" in location));
        }
    }
    Popup.loaded = false;
    exports.Popup = Popup;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],16:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime", "./SearchPanel", "./Card"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    var SearchPanel_1 = require("./SearchPanel");
    var Card_1 = require("./Card");
    class ProjectPanel {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (ProjectPanel.loaded)
                return;
            ProjectPanel.loaded = true;
            SearchPanel_1.SearchPanel.ensureLoaded();
            Card_1.Card.ensureLoaded();
            engine_1.tardigradeEngine.addTemplate("ProjectPanel", new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.TemplateNode(null, 0, [""], "SearchPanel", {}, { "input": new model_1.PointInfo("searchInput", {}, []) }), new model_1.ElementNode("projectList", 0, [""], "div", { "class": "projects-list" }, [new model_1.TemplateNode("cards", 1, [""], "Card", {}, {})])]));
        }
        static html(dto) {
            ProjectPanel.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("ProjectPanel", dto);
        }
        static element(dto) {
            return runtime_1.createElement(ProjectPanel.html(dto));
        }
        static create(dto) {
            let element = ProjectPanel.element(dto);
            return new ProjectPanel(element);
        }
        static of(element) {
            return new ProjectPanel(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        searchInput() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ProjectPanel", { "searchInput": 0 });
        }
        searchInputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ProjectPanel", hitTest);
            return (location != null && ("searchInput" in location));
        }
        projectList() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ProjectPanel", { "projectList": 0 });
        }
        projectListHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ProjectPanel", hitTest);
            return (location != null && ("projectList" in location));
        }
        cards(cardsIndex) {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "ProjectPanel", { "cards": cardsIndex });
        }
        cardsDomlet(cardsIndex) {
            let element = this.cards(cardsIndex);
            return Card_1.Card.of(element);
        }
        cardsHitDomlet(hitElement) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ProjectPanel", hitElement);
            if (location == null)
                return null;
            if (!("cards" in location))
                return null;
            return this.cardsDomlet(location["cards"]);
        }
        cardsIndex(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "ProjectPanel", hitTest);
            if (location != null && ("cards" in location))
                return location["cards"];
            return -1;
        }
        buildCards(dto) {
            return engine_1.tardigradeEngine.buildNodeHtml("ProjectPanel", "cards", dto);
        }
        addCards(dto) {
            let newItem = this.buildCards(dto);
            let newElement = runtime_1.createElement(newItem);
            this.projectList().appendChild(newElement);
            return newElement;
        }
        countCards() {
            return this.projectList().children.length;
        }
    }
    ProjectPanel.loaded = false;
    exports.ProjectPanel = ProjectPanel;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20,"./Card":10,"./SearchPanel":17}],17:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node_modules/tardigrade/target/engine/engine", "../../node_modules/tardigrade/target/engine/model", "../../node_modules/tardigrade/target/engine/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    var engine_1 = require("../../node_modules/tardigrade/target/engine/engine");
    var model_1 = require("../../node_modules/tardigrade/target/engine/model");
    var runtime_1 = require("../../node_modules/tardigrade/target/engine/runtime");
    class SearchPanel {
        constructor(rootElement) {
            this.rootElement = rootElement;
        }
        static ensureLoaded() {
            if (SearchPanel.loaded)
                return;
            SearchPanel.loaded = true;
            engine_1.tardigradeEngine.addTemplate("SearchPanel", new model_1.ElementNode(null, 0, [""], "div", {}, [new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-textfield mdl-js-textfield mdl-textfield--floating-label" }, [new model_1.ElementNode("input", 0, [""], "input", { "class": "mdl-textfield__input", "type": "text", "id": "searchBox" }, []), new model_1.ElementNode(null, 0, [""], "label", { "class": "mdl-textfield__label", "for": "searchBox" }, [new model_1.TextNode("Project search...")])]), new model_1.ElementNode(null, 0, [""], "div", { "class": "mdl-button mdl-button--icon" }, [new model_1.ElementNode(null, 0, [""], "i", { "class": "material-icons" }, [new model_1.TextNode("search")])])]));
        }
        static html(dto) {
            SearchPanel.ensureLoaded();
            return engine_1.tardigradeEngine.buildHtml("SearchPanel", dto);
        }
        static element(dto) {
            return runtime_1.createElement(SearchPanel.html(dto));
        }
        static create(dto) {
            let element = SearchPanel.element(dto);
            return new SearchPanel(element);
        }
        static of(element) {
            return new SearchPanel(element);
        }
        rootHtmlElement() { return this.rootElement; }
        setUserData(data) {
            let old = this.rootElement._tardigradeUserData || undefined;
            this.rootElement._tardigradeUserData = data;
            return old;
        }
        getUserData() {
            return this.rootElement._tardigradeUserData || undefined;
        }
        input() {
            return engine_1.tardigradeEngine.getPoint(this.rootElement, "SearchPanel", { "input": 0 });
        }
        inputHit(hitTest) {
            let location = engine_1.tardigradeEngine.getLocation(this.rootElement, "SearchPanel", hitTest);
            return (location != null && ("input" in location));
        }
    }
    SearchPanel.loaded = false;
    exports.SearchPanel = SearchPanel;
});

},{"../../node_modules/tardigrade/target/engine/engine":18,"../../node_modules/tardigrade/target/engine/model":19,"../../node_modules/tardigrade/target/engine/runtime":20}],18:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./runtime", "./model"], factory);
    }
})(function (require, exports) {
    "use strict";
    var runtime_1 = require("./runtime");
    var model_1 = require("./model");
    class TardigradeEngine {
        constructor() {
            this.templates = {};
        }
        addTemplate(name, template) {
            this.templates[name] = {
                name: name,
                rootNode: template,
                points: this.getPoints(template),
                dependentTemplates: template.getTemplateNodes()
            };
        }
        getTemplateDescriptor(name) {
            return this.templates[name];
        }
        buildHtml(templateName, dto) {
            var templateDescriptor = this.templates[templateName];
            if (templateDescriptor == null)
                return null;
            return this.buildNode(templateDescriptor.rootNode, templateDescriptor.rootNode, [dto]);
        }
        buildNodeHtml(templateName, nodeId, dto) {
            var templateDescriptor = this.templates[templateName];
            if (templateDescriptor == null)
                return null;
            var nodeToBuild = this.findNode(templateDescriptor.rootNode, nodeId);
            return this.buildNode(nodeToBuild, nodeToBuild, [dto]);
        }
        getPoint(templateElement, templateName, intermediates) {
            var templateDescriptor = this.templates[templateName];
            if (templateDescriptor == null)
                return null;
            var templatePoints = templateDescriptor.points;
            let longestPath = -1;
            let pointName = null;
            for (let test in intermediates) {
                if (templatePoints[test].path.length > longestPath) {
                    longestPath = templatePoints[test].path.length;
                    pointName = test;
                }
            }
            var targetPath = templatePoints[pointName];
            var element = templateElement;
            for (let i = 0; i < targetPath.path.length; i++) {
                let index = targetPath.path[i];
                if (typeof index === "string")
                    index = intermediates[index];
                let children = element.children;
                if (children == null || children.length <= index)
                    return null;
                element = element.children[index];
            }
            return element;
        }
        getLocation(templateElement, templateName, element) {
            var templateDescriptor = this.templates[templateName];
            if (templateDescriptor == null)
                return null;
            var templatePoints = templateDescriptor.points;
            var chain = runtime_1.domChain(templateElement, element);
            var indices = [];
            for (var i = 1; i < chain.length; i++)
                indices.push([].indexOf.call(chain[i - 1].children, chain[i]));
            var res = {};
            for (var pointName in templatePoints) {
                var path = templatePoints[pointName].path;
                if (indices.length < path.length)
                    continue;
                let i = 0;
                for (i = 0; i < path.length; i++) {
                    if ((typeof path[i] != "string") && path[i] !== indices[i])
                        break;
                }
                if (i == path.length) {
                    if (typeof path[i - 1] === "string")
                        res[pointName] = indices[i - 1];
                    else
                        res[pointName] = 0;
                }
            }
            return res;
        }
        findNode(node, nodeId) {
            if (node == null)
                return null;
            if (node instanceof model_1.ParentNode && node.xId === nodeId)
                return node;
            if (node instanceof model_1.ElementNode) {
                for (let child of node.getChildren()) {
                    let hit = this.findNode(child, nodeId);
                    if (hit != null)
                        return hit;
                }
            }
            else if (node instanceof model_1.TemplateNode) {
                for (let childPointName in node.getChildren()) {
                    let childPoint = node.getChildren()[childPointName];
                    if (!childPoint.getChildren()) {
                        console.log('point ' + childPointName + ' has no child in template ' + node.name);
                    }
                    else {
                        for (let childNode of childPoint.getChildren()) {
                            let hit = this.findNode(childNode, nodeId);
                            if (hit != null)
                                return hit;
                        }
                    }
                }
            }
            return null;
        }
        buildNode(templateRoot, node, dtos) {
            if (node instanceof model_1.ElementNode)
                return this.buildElementNode(templateRoot, node, dtos);
            else if (node instanceof model_1.TemplateNode)
                return this.buildTemplateNode(templateRoot, node, dtos);
            else if (node instanceof model_1.TextNode)
                return this.buildTextNode(node);
            else
                return null;
        }
        getDto(field, dtos) {
            if (dtos == null || field == null)
                return null;
            for (var i = dtos.length - 1; i >= 0; i--) {
                var dto = dtos[i];
                if (field in dto)
                    return dto[field];
            }
            return null;
        }
        buildTagBegin(tagName, attrs) {
            var res = "<";
            res += tagName;
            for (var key in attrs)
                res += ` ${key}='${attrs[key]}'`;
            res += ">";
            return res;
        }
        buildTagEnd(tagName) {
            return `</${tagName}>`;
        }
        mergeAttributes(attrs1, attrs2) {
            return Object.assign({}, attrs1, attrs2);
        }
        buildElementOverride(node, attrs, text) {
            if (node.name.toLowerCase() == "br")
                return "<br/>";
            var res = "";
            res += this.buildTagBegin(node.name, attrs);
            res += text;
            res += this.buildTagEnd(node.name);
            return res;
        }
        buildElementSpecimen(templateRoot, node, attrs, dtos) {
            if (node.name.toLowerCase() == "br")
                return "<br/>";
            var res = "";
            res += this.buildTagBegin(node.name, attrs);
            if (node.getChildren() != null) {
                for (var child of node.getChildren()) {
                    res += this.buildNode(templateRoot, child, dtos);
                }
            }
            res += this.buildTagEnd(node.name);
            return res;
        }
        buildElementNode(templateRoot, node, dtos) {
            var dto = this.getDto(node.xId, dtos);
            if (node == templateRoot) {
                var dtoRootContent = this.getDto("_root", dtos);
                if (dtoRootContent != null)
                    dto = dtoRootContent;
            }
            var dtoAttrs = node.xId != null ? this.getDto("@" + node.xId, dtos) : null;
            if (node == templateRoot) {
                var dtoRootAttrs = this.getDto("@_root", dtos);
                if (dtoRootAttrs != null)
                    dtoAttrs = dtoRootAttrs;
            }
            var res = "";
            if (node.xCardinal == model_1.Cardinal.Single) {
                var attrs = this.mergeAttributes(node.attributes, dtoAttrs);
                if (dto == null) {
                    res += this.buildElementSpecimen(templateRoot, node, attrs, dtos);
                }
                else if (typeof dto == 'string') {
                    res += this.buildElementOverride(node, attrs, dto);
                }
                else if (dto instanceof Array) {
                    res += "<ERROR DTO HAD AN ARRAY, NOT EXPECTED!!!/>";
                }
                else if (dto instanceof Object) {
                    dtos.push(dto);
                    res += this.buildElementSpecimen(templateRoot, node, attrs, dtos);
                    dtos.pop();
                }
            }
            else if (node.xCardinal == model_1.Cardinal.Multiple) {
                if (dto == null) {
                }
                else if (typeof dto == 'string') {
                    let attrs = this.mergeAttributes(node.attributes, dtoAttrs);
                    res += this.buildElementOverride(node, attrs, dto);
                }
                else if (dto instanceof Array) {
                    for (var i = 0; i < dto.length; i++) {
                        var item = dto[i];
                        let attrs = this.mergeAttributes(node.attributes, dtoAttrs instanceof Array ? dtoAttrs[i] : dtoAttrs);
                        if (typeof item == 'string') {
                            res += this.buildElementOverride(node, attrs, item);
                        }
                        else {
                            dtos.push(item);
                            res += this.buildElementSpecimen(templateRoot, node, dtoAttrs, dtos);
                            dtos.pop();
                        }
                    }
                }
                else if (dto instanceof Object) {
                    let attrs = this.mergeAttributes(node.attributes, dtoAttrs);
                    dtos.push(dto);
                    res += this.buildElementSpecimen(templateRoot, node, dtoAttrs, dtos);
                    dtos.pop();
                }
            }
            return res;
        }
        getPoints(node) {
            var res = {};
            this.visitNode(node, [], (xId, nodeInstance, path) => {
                res[xId] = {
                    id: xId,
                    node: nodeInstance,
                    path: path.slice()
                };
            });
            return res;
        }
        visitNode(node, currentPath, visitor) {
            if (node instanceof model_1.ElementNode)
                this.visitElementNode(node, currentPath, visitor);
            else if (node instanceof model_1.TemplateNode)
                this.visitTemplateNode(node, currentPath, visitor);
        }
        visitElementNode(node, currentPath, visitor) {
            if (node.xId != null) {
                if (node.xCardinal == model_1.Cardinal.Multiple) {
                    currentPath.pop();
                    currentPath.push(node.xId);
                }
                visitor(node.xId, node, currentPath);
            }
            if (node.getChildren() != null) {
                let childIdx = 0;
                for (var i = 0; i < node.getChildren().length; i++) {
                    let child = node.getChildren()[i];
                    currentPath.push(childIdx);
                    this.visitNode(child, currentPath, visitor);
                    currentPath.pop();
                    if (!(child instanceof model_1.TextNode))
                        childIdx++;
                }
            }
        }
        visitTemplateNode(node, currentPath, visitor) {
            if (node.xId != null) {
                if (node.xCardinal == model_1.Cardinal.Multiple) {
                    currentPath.pop();
                    currentPath.push(node.xId);
                }
                visitor(node.xId, node, currentPath);
            }
            let subTemplatePoints = this.templates[node.name].points;
            if (node.getChildren() != null) {
                for (var pointName in node.getChildren()) {
                    var pointInfo = node.getChildren()[pointName];
                    let pointPath = currentPath.concat(subTemplatePoints[pointName].path);
                    if (pointInfo.xId != null)
                        visitor(pointInfo.xId, pointInfo, pointPath);
                    if (pointInfo.getChildren() != null) {
                        let childIdx = 0;
                        for (var i = 0; i < pointInfo.getChildren().length; i++) {
                            let child = pointInfo.getChildren()[i];
                            pointPath.push(childIdx);
                            this.visitNode(child, pointPath, visitor);
                            pointPath.pop();
                            if (!(child instanceof model_1.TextNode))
                                childIdx++;
                        }
                    }
                }
            }
        }
        buildTemplateNode(templateRoot, node, dtos) {
            var templateDescriptor = this.templates[node.name];
            if (templateDescriptor == null)
                return `<ERROR Template ${node.name} not found !/>`;
            var templatePoints = templateDescriptor.points;
            var res = "";
            let attrs = null;
            let dto = null;
            if (node.xId != null) {
                attrs = this.getDto("@" + node.xId, dtos);
                dto = this.getDto(node.xId, dtos);
            }
            var templateDtos = [];
            if (node.xCardinal == model_1.Cardinal.Single) {
                let templateDto = {};
                if (attrs != null)
                    templateDto["@_root"] = attrs;
                if (dto != null)
                    templateDto["_root"] = dto;
                templateDtos = [templateDto];
            }
            else if (node.xCardinal == model_1.Cardinal.Multiple && dto != null) {
                for (var i = 0; i < dto.length; i++) {
                    let oneDto = dto[i];
                    let templateDto = {};
                    if (attrs != null) {
                        if (attrs instanceof Array)
                            templateDto["@_root"] = attrs[i];
                        else
                            templateDto["@_root"] = attrs;
                    }
                    if (oneDto != null)
                        templateDto["_root"] = oneDto;
                    templateDtos.push(oneDto);
                }
            }
            for (var i = 0; i < templateDtos.length; i++) {
                var templateDto = templateDtos[i];
                if (typeof templateDto == 'string') {
                    res += this.buildNode(templateDescriptor.rootNode, templateDescriptor.rootNode, [{ "_root": templateDto }]);
                }
                else {
                    for (var pointName in templatePoints) {
                        let nodeChildren = node.getChildren();
                        var pointInfo = ((nodeChildren != null) && (pointName in nodeChildren)) ? nodeChildren[pointName] : null;
                        var pointDto = null;
                        var pointAttrs = null;
                        if (node.xCardinal == model_1.Cardinal.Single && pointInfo != null && pointInfo.xId != null) {
                            pointDto = this.getDto(pointInfo.xId, dtos);
                            pointAttrs = this.getDto("@" + pointInfo.xId, dtos);
                        }
                        if (pointDto != null)
                            templateDto[pointName] = pointDto;
                        if (pointAttrs != null)
                            templateDto["@" + pointName] = pointAttrs;
                        if (pointInfo != null && (pointDto == null || (typeof pointDto != 'string'))) {
                            if (pointInfo.attributes != null)
                                templateDto["@" + pointName] = pointInfo.attributes;
                            if (pointInfo.getChildren() != null) {
                                var pointContent = "";
                                let pushedDto = false;
                                if (dto != null && (dto instanceof Array) && node.xCardinal == model_1.Cardinal.Multiple) {
                                    dtos.push(dto[i]);
                                    pushedDto = true;
                                }
                                for (var pointChild of pointInfo.getChildren()) {
                                    pointContent += this.buildNode(templateRoot, pointChild, dtos);
                                }
                                templateDto[pointName] = pointContent;
                                if (pushedDto)
                                    dtos.pop();
                            }
                        }
                    }
                    res += this.buildNode(templateDescriptor.rootNode, templateDescriptor.rootNode, [templateDto]);
                }
            }
            return res;
        }
        buildTextNode(node) {
            return node.text;
        }
    }
    exports.TardigradeEngine = TardigradeEngine;
    exports.tardigradeEngine = new TardigradeEngine();
});

},{"./model":19,"./runtime":20}],19:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    function escapeText(text) {
        return text.replace(/"/g, '\\\"');
    }
    function visitDeep(node, visitor) {
        if (node instanceof ElementNode) {
            visitor.visitElementNode(node);
            if (node.getChildren() != null) {
                for (let child of node.getChildren())
                    visitDeep(child, visitor);
            }
        }
        else if (node instanceof TemplateNode) {
            visitor.visitTemplateNode(node);
            if (node.getChildren() != null) {
                for (var pointName in node.getChildren()) {
                    var pointInfo = node.getChildren()[pointName];
                    visitor.visitPointInfo(pointInfo);
                    if (pointInfo.getChildren() != null) {
                        for (let child of pointInfo.getChildren())
                            visitDeep(child, visitor);
                    }
                }
            }
        }
        else if (node instanceof TextNode) {
            visitor.visitTextNode(node);
        }
    }
    (function (Cardinal) {
        Cardinal[Cardinal["Single"] = 0] = "Single";
        Cardinal[Cardinal["Multiple"] = 1] = "Multiple";
    })(exports.Cardinal || (exports.Cardinal = {}));
    var Cardinal = exports.Cardinal;
    class Node {
        visitDeep(visitor) {
            return visitDeep(this, visitor);
        }
    }
    exports.Node = Node;
    class TextNode extends Node {
        constructor(text) {
            super();
            this.text = text;
        }
        log(prefix) {
            console.log(`${prefix}TEXT ${this.text}`);
        }
        quine() {
            return `new TextNode("${escapeText(this.text)}")`;
        }
    }
    exports.TextNode = TextNode;
    class ParentNode extends Node {
        constructor(xId, xCardinal, xOptions, name, attributes) {
            super();
            this.xId = xId;
            this.xCardinal = xCardinal;
            this.xOptions = xOptions;
            this.name = name;
            this.attributes = attributes;
        }
        logBase() {
            var a = [];
            if (this.attributes != null) {
                for (var an in this.attributes)
                    a.push(`${an}=${this.attributes[an]}`);
            }
            return `${this.name} id:${this.xId}, cardinal:${this.xCardinal}, options:${this.xOptions.length > 0 ? this.xOptions.join(", ") : "-"}, attrs: ${a.length > 0 ? a.join(", ") : "-"}`;
        }
        getTemplateNodes() {
            let names = {};
            this.fetchTemplateNodes(this, names);
            let res = [];
            for (let name in names)
                res.push(name);
            return res;
        }
        fetchTemplateNodes(node, templateNames) {
            if (node instanceof ElementNode) {
                if (node.getChildren() != null) {
                    for (let child of node.getChildren())
                        this.fetchTemplateNodes(child, templateNames);
                }
            }
            else if (node instanceof TemplateNode) {
                templateNames[node.name] = 1;
                if (node.getChildren() != null) {
                    for (var pointName in node.getChildren()) {
                        var pointInfo = node.getChildren()[pointName];
                        if (pointInfo.getChildren() != null) {
                            for (let child of pointInfo.getChildren())
                                this.fetchTemplateNodes(child, templateNames);
                        }
                    }
                }
            }
        }
    }
    exports.ParentNode = ParentNode;
    class ElementNode extends ParentNode {
        constructor(xId, xCardinal, xOptions, name, attributes, children) {
            super(xId, xCardinal, xOptions, name, attributes);
            this.xId = xId;
            this.xCardinal = xCardinal;
            this.xOptions = xOptions;
            this.name = name;
            this.attributes = attributes;
            this.children = children;
            for (let child of this.children)
                child.parent = this;
        }
        log(prefix) {
            console.log(`${prefix}${this.logBase()}`);
            for (var c of this.children)
                c.log(prefix + "  ");
        }
        quine() {
            let xIdString = this.xId == null ? "null" : (`"${this.xId}"`);
            let optionsString = (this.xOptions == null || this.xOptions.length == 0) ? "null" : ("[" + this.xOptions.map(o => `"${o}"`).join(",") + "]");
            let attributesString = [];
            for (let name in this.attributes)
                attributesString.push(`"${name}": "${escapeText(this.attributes[name])}"`);
            let childrenString = this.children == null ? "null" : ("[" + this.children.map(c => c.quine()).join(', ') + "]");
            return `new ElementNode(${xIdString}, <Cardinal>${this.xCardinal}, ${optionsString}, "${this.name}", {${attributesString.join(', ')}}, ${childrenString})`;
        }
        getChildren() {
            return this.children;
        }
        addChild(child) {
            child.parent = this;
            if (this.children == null)
                this.children = [child];
            else
                this.children.push(child);
        }
    }
    exports.ElementNode = ElementNode;
    class TemplateNode extends ParentNode {
        constructor(xId, xCardinal, xOptions, name, attributes, children) {
            super(xId, xCardinal, xOptions, name, attributes);
            this.xId = xId;
            this.xCardinal = xCardinal;
            this.xOptions = xOptions;
            this.name = name;
            this.attributes = attributes;
            this.children = children;
            for (let i in this.children)
                this.children[i].parent = this;
        }
        log(prefix) {
            console.log(`${prefix}template ${this.logBase()}`);
            for (var point in this.children) {
                console.log(`${prefix}  POINT ${point} ${this.children[point].logBase()}`);
                if (this.children[point].getChildren() != null) {
                    for (var child of this.children[point].getChildren())
                        child.log(prefix + "    ");
                }
            }
        }
        quine() {
            let xIdString = this.xId == null ? "null" : (`"${this.xId}"`);
            let optionsString = (this.xOptions == null || this.xOptions.length == 0) ? "null" : ("[" + this.xOptions.map(o => `"${o}"`).join(",") + "]");
            let attributesString = [];
            for (let name in this.attributes)
                attributesString.push(`"${name}": "${escapeText(this.attributes[name])}"`);
            let childrenString = [];
            for (let name in this.children) {
                let child = this.children[name];
                childrenString.push(`"${name}": ${child.quine()}`);
            }
            return `new TemplateNode(${xIdString}, <Cardinal>${this.xCardinal}, ${optionsString}, "${this.name}", {${attributesString.join(', ')}}, {${childrenString.join(', ')}})`;
        }
        getChildren() {
            return this.children;
        }
        addChildren(key, child) {
            child.parent = this;
            if (this.children == null)
                this.children = {};
            this.children[key] = child;
        }
    }
    exports.TemplateNode = TemplateNode;
    class PointInfo {
        constructor(xId, attributes, children) {
            this.xId = xId;
            this.attributes = attributes;
            this.children = children;
        }
        logBase() {
            var a = [];
            if (this.attributes != null) {
                for (var an in this.attributes)
                    a.push(`${an}=${this.attributes[an]}`);
            }
            return `id: ${this.xId}, attrs: ${a.length > 0 ? a.join(", ") : "-"}`;
        }
        quine() {
            let xIdString = this.xId == null ? "null" : (`"${this.xId}"`);
            let attributesString = [];
            for (let name in this.attributes)
                attributesString.push(`"${name}": "${escapeText(this.attributes[name])}"`);
            let childrenString = this.children.map(c => c.quine());
            return `new PointInfo(${xIdString}, {${attributesString.join(', ')}}, [${childrenString.join(', ')}])`;
        }
        addChild(child) {
            child.parent = this;
            if (this.children == null)
                this.children = [child];
            else
                this.children.push(child);
        }
        getChildren() {
            return this.children;
        }
    }
    exports.PointInfo = PointInfo;
});

},{}],20:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    function indexOf(parent, child) {
        var index = [].indexOf.call(parent.children, child);
        return index;
    }
    exports.indexOf = indexOf;
    function domChain(parent, child) {
        var res = [];
        while (child != null) {
            res.push(child);
            if (child === parent) {
                res = res.reverse();
                return res;
            }
            child = child.parentElement;
        }
        return null;
    }
    exports.domChain = domChain;
    function createElement(html) {
        var element = document.createElement("div");
        if (html.indexOf("<tr") === 0) {
            html = "<table><tbody>" + html + "</tbody></table>";
            element.innerHTML = html;
            return element.children[0].children[0].children[0];
        }
        if (html.indexOf("<td") === 0) {
            html = "<table><tbody><tr>" + html + "</tr></tbody></table>";
            element.innerHTML = html;
            return element.children[0].children[0].children[0].children[0];
        }
        element.innerHTML = html;
        return element.children[0];
    }
    exports.createElement = createElement;
});

},{}]},{},[7]);
