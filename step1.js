const TokenType = {
  TAG_OPEN: "TAG_OPEN",
  TAG_NAME: "TAG_NAME",
  TAG_CLOSE: "TAG_CLOSE",
  DATA: "DATA",
  END_TAG_OPEN: "END_TAG_OPEN",
  END_TAG_NAME: "END_TAG_NAME",
  END_TAG_CLOSE: "END_TAG_CLOSE",
};

class NodeTree {
  nodeName = "";
  content = "";
  endNodeName = "";
  constructor(nodeName) {
    this.nodeName = nodeName;
  }
}

function parseHtml(htmlString) {
  /** @type {NodeTree} */
  let currentNode = null;
  let state = TokenType.DATA;
  for (let k of htmlString) {
    if (state === TokenType.DATA) {
      if (k === "<") {
        state = TokenType.TAG_OPEN;
      } else {
        currentNode.content += k;
      }
    } else if (state === TokenType.TAG_OPEN) {
      if (isAlphaNumeric(k)) {
        state = TokenType.TAG_NAME;
        currentNode = new NodeTree("");
        currentNode.nodeName += k;
      } else if (k === "/") {
        state = TokenType.END_TAG_OPEN;
      }
    } else if (state === TokenType.TAG_NAME) {
      if (isAlphaNumeric(k)) {
        currentNode.nodeName += k;
      } else if (k === ">") {
        state = TokenType.DATA;
      }
    } else if (state === TokenType.END_TAG_OPEN) {
      if (isAlphaNumeric(k)) {
        state = TokenType.END_TAG_NAME;
        currentNode.endNodeName += k;
      } else if (k === ">") {
        state = TokenType.DATA;
      }
    } else if (state === TokenType.END_TAG_NAME) {
      if (isAlphaNumeric(k)) {
        currentNode.endNodeName += k;
      } else if (k === ">") {
        state = TokenType.DATA;
      }
    }
  }
  return currentNode;
}

function isAlphaNumeric(s) {
  return /[A-Za-z0-9]/.test(s);
}

const htmlString = `<div>hello world</div>`;
console.log(parseHtml(htmlString));
