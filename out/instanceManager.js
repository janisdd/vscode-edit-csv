"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceManager = void 0;
/**
 * we need keep track of all editor instances
 * so we can ensure that e.g. we open only one editor per csv file,
 * find the source file for an editor...
 */
class InstanceManager {
    constructor() {
        this.instances = {};
    }
    getAllInstances() {
        const keys = Object.keys(this.instances);
        const allInstances = keys.map(p => this.instances[p]);
        return allInstances;
    }
    addInstance(instance) {
        const oldInstance = this.instances[instance.sourceUri.toString()];
        if (oldInstance) {
            throw new Error('tried to add a new instance but we got old one (with the source uri)');
        }
        this.instances[instance.sourceUri.toString()] = instance;
    }
    removeInstance(instance) {
        const oldInstance = this.instances[instance.sourceUri.toString()];
        if (!oldInstance) {
            throw new Error('could not find old instance');
        }
        delete this.instances[instance.sourceUri.toString()];
    }
    findInstanceBySourceUri(sourceUri) {
        //key is the source uri ... but we might change that so use find
        // const instance = this.instances[sourceUri.toString()]
        const instance = this.getAllInstances().find(p => p.sourceUri === sourceUri);
        if (!instance)
            return null;
        return instance;
    }
    findInstanceByEditorUri(editorUri) {
        const instance = this.getAllInstances().find(p => p.editorUri === editorUri);
        if (!instance)
            return null;
        return instance;
    }
    hasActiveEditorInstance() {
        const activeInstances = this.getAllInstances().filter(p => p.panel.active);
        return activeInstances.length > 0; // or === 1 ?
    }
    getActiveEditorInstance() {
        const activeInstances = this.getAllInstances().filter(p => p.panel.active);
        if (activeInstances.length === 0) {
            throw new Error('no active editor found');
        }
        if (activeInstances.length > 1) {
            throw new Error('too many active editors found');
        }
        return activeInstances[0];
    }
}
exports.InstanceManager = InstanceManager;
//# sourceMappingURL=instanceManager.js.map