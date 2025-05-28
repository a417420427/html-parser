const TokenType = {
  TAG_OPEN: 'TAG_OPEN',
  TAG_NAME: 'TAG_NAME',
  TAG_CLOSE: 'TAG_CLOSE',
  DATA: 'DATA',
  END_TAG_OPEN: 'END_TAG_OPEN',
  END_TAG_NAME: 'END_TAG_NAME',
  END_TAG_CLOSE: 'END_TAG_CLOSE',

  ATTRIBUTE_NAME_START: 'ATTRIBUTE_NAME_START',
  ATTRIBUTE_NAME: 'ATTRIBUTE_NAME',
  ATTRIBUTE_NAME_EQUAL: 'ATTRIBUTE_NAME_EQUAL',
  ATTRIBUTE_VALUE_START: 'ATTRIBUTE_VALUE_START',
  ATTRIBUTE_VALUE: 'ATTRIBUTE_VALUE',
  ATTRIBUTE_VALUE_END: 'ATTRIBUTE_VALUE_END',

};

class NodeTree {
  nodeName = '';
  content = ''
  endNodeName = ''
  attributes = []
  constructor(nodeName) {
    this.nodeName = nodeName;
    this.children = [];
  }
}


function parseHtml(htmlString) {
  /** @type {NodeTree} */
  let currentNode = null;
  let state = TokenType.DATA
  let currentAttribute = null 
  for(let k of htmlString) {
    if(state === TokenType.DATA) {
      if(k === '<') {
        state = TokenType.TAG_OPEN
      } else {
        currentNode.content += k
      }
    } else if(state === TokenType.TAG_OPEN) {
      if(isAlphaNumeric(k)) {
        state = TokenType.TAG_NAME
        currentNode = new NodeTree('')
        currentNode.nodeName += k
      } else if(k === '/') {
        state = TokenType.END_TAG_OPEN
      }
    } else if(state === TokenType.TAG_NAME) {
      if(isAlphaNumeric(k)) {
        currentNode.nodeName += k
      } else if(isEmptyContent(k)) {
        state = TokenType.ATTRIBUTE_NAME_START
      }if(k === '>') {
        state = TokenType.DATA
      }
    } else if(state === TokenType.END_TAG_OPEN) {
      if(isAlphaNumeric(k)) {
        state = TokenType.END_TAG_NAME
        currentNode.endNodeName += k
      } else if(k === '>') {
        state = TokenType.DATA
      }
    } else if(state === TokenType.END_TAG_NAME) {
      if(isAlphaNumeric(k)) {
        currentNode.endNodeName += k
      } else if(k === '>') {
        state = TokenType.DATA
      }
    } else if(state === TokenType.ATTRIBUTE_NAME_START) {
      if(isAlphaNumeric(k)) {
        currentAttribute = {name: k, value: ''}
        
        state = TokenType.ATTRIBUTE_NAME
      }
    } else if(state === TokenType.ATTRIBUTE_NAME) {
      if(isAlphaNumeric(k)) {
        state = TokenType.ATTRIBUTE_NAME
        currentAttribute.name += k
      } else if(k === '=') {
        state = TokenType.ATTRIBUTE_VALUE_START
      }
    } else if(state === TokenType.ATTRIBUTE_VALUE_START) {
      if(k === '"' || k === "'") {
        state = TokenType.ATTRIBUTE_VALUE
      }
    } else if(state === TokenType.ATTRIBUTE_VALUE) {
      if(k === '"' || k === "'") {
        state = TokenType.ATTRIBUTE_VALUE_END
        currentNode.attributes.push(currentAttribute)
        currentAttribute = null
      } else {
        currentAttribute.value += k
      }
    } else if(state === TokenType.ATTRIBUTE_VALUE_END) {
      if(isEmptyContent(k)) {
        state = TokenType.ATTRIBUTE_NAME_START
      } else if(k === '>') {
        state = TokenType.DATA
      }
    }
  }
  return currentNode
}

function isAlphaNumeric(s) {
  return /[A-Za-z0-9]/.test(s);
}

function isEmptyContent(s) {
  return /[\s\n\t\f]/.test(s);
}


const htmlString = `<div attr="attrValue">hello world</div>`
console.log(parseHtml(htmlString))