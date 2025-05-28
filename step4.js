const TokenType = {
  TAG_OPEN: "TAG_OPEN",
  TAG_NAME: "TAG_NAME",
  TAG_CLOSE: "TAG_CLOSE",
  DATA: "DATA",
  END_TAG_OPEN: "END_TAG_OPEN",
  END_TAG_NAME: "END_TAG_NAME",
  END_TAG_CLOSE: "END_TAG_CLOSE",

  BEFORE_ATTRIBUTE_NAME: "BEFORE_ATTRIBUTE_NAME",
  ATTRIBUTE_NAME: "ATTRIBUTE_NAME",
  ATTRIBUTE_VALUE_START: "ATTRIBUTE_VALUE_START",
  ATTRIBUTE_VALUE: "ATTRIBUTE_VALUE",
  SELF_CLOSING_START_TAG: "SELF_CLOSING_START_TAG",
  ATTRIBUTE_VALUE_END: "ATTRIBUTE_VALUE_END",
};

class NodeTree {
  nodeName = "";
  endNodeName = "";
  children = [];
  content = "";
  attributes = [];
  constructor(nodeName) {
    this.nodeName = nodeName;
  }
}

const stacks = [];

let buffer = "";
function parseHtml(htmlString) {
  /** @type {NodeTree} */
  let currentNode = null;
  let state = TokenType.DATA;
  let currentAttribute = null;
  const root = new NodeTree("#document");
  stacks.push(root);
  currentNode = root;
  for (let k of htmlString) {
    if (state === TokenType.DATA) {
      if (k === "<") {
        state = TokenType.TAG_OPEN;

        if (buffer.trim()) {
          const textNode = new NodeTree("#text");
          textNode.content = buffer;
          const parentNode = stacks[stacks.length - 1];
          if (parentNode) {
            parentNode.children.push(textNode);
          }
        }
        buffer = "";
      } else {
        buffer += k;
      }
    } else if (state === TokenType.TAG_OPEN) {
      if (isAlphaNumeric(k)) {
        state = TokenType.TAG_NAME;
        currentNode = new NodeTree("");
        currentNode.nodeName += k;
        const parentNode = stacks[stacks.length - 1];
        if (parentNode) {
          parentNode.children.push(currentNode);
        }
        stacks.push(currentNode);
      } else if (k === "/") {
        state = TokenType.END_TAG_OPEN;
      }
    } else if (state === TokenType.TAG_NAME) {
      if (isAlphaNumeric(k)) {
        currentNode.nodeName += k;
      } else if (k === "/") {
        state = TokenType.SELF_CLOSING_START_TAG;
      } else if (isEmptyContent(k)) {
        state = TokenType.BEFORE_ATTRIBUTE_NAME;
      }
      if (k === ">") {
        state = TokenType.DATA;
      }
    } else if (state === TokenType.END_TAG_OPEN) {
      if (isAlphaNumeric(k)) {
        state = TokenType.END_TAG_NAME;
        const top = stacks[stacks.length - 1];
        if (top) {
          top.endNodeName += k;
        }
      } else if (k === ">") {
        state = TokenType.DATA;
      }
    } else if (state === TokenType.END_TAG_NAME) {
      if (isAlphaNumeric(k)) {
        const top = stacks[stacks.length - 1];
        if (top) {
          top.endNodeName += k;
        }
      } else if (k === ">") {
        stacks.pop();
        state = TokenType.DATA;
      }
    } else if (state === TokenType.BEFORE_ATTRIBUTE_NAME) {
      if (isAlphaNumeric(k)) {
        currentAttribute = { name: k, value: "" };
        state = TokenType.ATTRIBUTE_NAME;
      } else if (k === "/") {
        state = TokenType.SELF_CLOSING_START_TAG;
      }
    } else if (state === TokenType.ATTRIBUTE_NAME) {
      if (isAlphaNumeric(k)) {
        state = TokenType.ATTRIBUTE_NAME;
        currentAttribute.name += k;
      } else if (k === "=") {
        state = TokenType.ATTRIBUTE_VALUE_START;
      }
    } else if (state === TokenType.ATTRIBUTE_VALUE_START) {
      if (k === '"' || k === "'") {
        state = TokenType.ATTRIBUTE_VALUE;
      }
    } else if (state === TokenType.ATTRIBUTE_VALUE) {
      if (k === '"' || k === "'") {
        state = TokenType.ATTRIBUTE_VALUE_END;
        currentNode.attributes.push(currentAttribute);
        currentAttribute = null;
      } else {
        currentAttribute.value += k;
      }
    } else if (state === TokenType.ATTRIBUTE_VALUE_END) {
      if (isEmptyContent(k)) {
        state = TokenType.BEFORE_ATTRIBUTE_NAME;
      } else if (k === "/") {
        state = TokenType.SELF_CLOSING_START_TAG;
      } else if (k === ">") {
        state = TokenType.DATA;
      }
    } else if (state === TokenType.SELF_CLOSING_START_TAG) {
      if (k === ">") {
        stacks.pop();
        currentNode = stacks[stacks.length - 1] || null;
        state = TokenType.DATA;
      }
    }
  }
  return root;
}

function isAlphaNumeric(s) {
  return /[A-Za-z0-9]/.test(s);
}

function isEmptyContent(s) {
  return /[\s\n\t\f]/.test(s);
}

const htmlString = `<div attr="attrValue">
  <h3 class="h3">标题</h3> 333 <br />
  <div class="div2">文本内容</div>
</div>`;
console.log(parseHtml(htmlString));
