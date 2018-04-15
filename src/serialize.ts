class Serialize {
    static serializeObject(self: any, props = Object.keys(self)) {
        const obj = {} as any;
        obj["@"] = self.constructor.name;
        for (const name of props) {
            obj[name] = this.serialize(self[name]);
        }
        return obj;
    }

    static serialize(self: any) {
        if (self instanceof Array) {
            return self.map((elem) => this.serialize(elem));
        } else if (typeof self === "object") {
            if ("serialize" in self as any) {
                return self.serialize();
            } else {
                return this.serializeObject(self);
            }
        } else {
            return self;
        }
    }
}