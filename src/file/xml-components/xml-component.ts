import { BaseXmlComponent, IContext } from "./base";
import { IXmlableObject } from "./xmlable-object";

export const EMPTY_OBJECT = Object.seal({});

export abstract class XmlComponent extends BaseXmlComponent {
    // tslint:disable-next-line:readonly-keyword no-any
    protected root: (BaseXmlComponent | string | any)[];

    constructor(rootKey: string) {
        super(rootKey);
        this.root = new Array<BaseXmlComponent | string>();
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        const children = this.root
            .map((comp) => {
                if (comp instanceof BaseXmlComponent) {
                    return comp.prepForXml(context);
                }
                return comp;
            })
            .filter((comp) => comp !== undefined); // Exclude undefined
        // If we only have a single IXmlableObject in our children array and it
        // represents our attributes, use the object itself as our children to
        // avoid an unneeded XML close element.
        // Additionally, if the array is empty, use an empty object as our
        // children in order to get an empty XML element generated.
        let rootValue = EMPTY_OBJECT;
        if (children.length) {
            rootValue = children;
            if (children.length === 1 && children[0] && children[0]._attr) {
                rootValue = children[0];
            }
        }

        return {
            [this.rootKey]: rootValue,
        };
    }

    public addChildElement(child: XmlComponent | string): XmlComponent {
        this.root.push(child);

        return this;
    }
}

export abstract class IgnoreIfEmptyXmlComponent extends XmlComponent {
    public prepForXml(context: IContext): IXmlableObject | undefined {
        const result = super.prepForXml(context);
        // Ignore the object if its falsey or is an empty object (would produce
        // an empty XML element if allowed to be included in the output).
        if (result && (typeof result[this.rootKey] !== "object" || Object.keys(result[this.rootKey]).length)) {
            return result;
        }
    }
}
