class Serialize {
    static serializeObject(self, props = Object.keys(self)) {
        const obj = {};
        obj["@"] = self.constructor.name;
        for (const name of props) {
            obj[name] = this.serialize(self[name]);
        }
        return obj;
    }
    static serialize(self) {
        if (self instanceof Array) {
            return self.map((elem) => this.serialize(elem));
        }
        else if (typeof self === "object") {
            if ("serialize" in self) {
                return self.serialize();
            }
            else {
                return this.serializeObject(self);
            }
        }
        else {
            return self;
        }
    }
}
