const TokenType = {
  TAG_OPEN: 'TAG_OPEN',
  TAG_NAME: 'TAG_NAME',
  TAG_CLOSE: 'TAG_CLOSE',
  DATA: 'DATA',
  END_TAG_OPEN: 'END_TAG_OPEN',
  END_TAG_NAME: 'END_TAG_NAME',
  END_TAG_CLOSE: 'END_TAG_CLOSE',

  BEFORE_ATTRIBUTE_NAME: 'BEFORE_ATTRIBUTE_NAME',
  ATTRIBUTE_NAME: 'ATTRIBUTE_NAME',
  ATTRIBUTE_VALUE_START: 'ATTRIBUTE_VALUE_START',
  ATTRIBUTE_VALUE: 'ATTRIBUTE_VALUE',
  ATTRIBUTE_VALUE_END: 'ATTRIBUTE_VALUE_END',

};

class NodeTree {
  nodeName = '';
  content = ''
  endNodeName = ''
  children = []
  attributes = []
  constructor(nodeName) {
    this.nodeName = nodeName;
  }
}

const stacks = []

function parseHtml(htmlString) {
  /** @type {NodeTree} */
  let currentNode = null;
  let state = TokenType.DATA
  let currentAttribute = null 
  const root = new NodeTree('#document')
  stacks.push(root)
  currentNode = root
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

        const parentNode = stacks[stacks.length - 1]
        if(parentNode) {
          parentNode.children.push(currentNode)
        }
        stacks.push(currentNode)
        
      } else if(k === '/') {
        state = TokenType.END_TAG_OPEN
      }
    } else if(state === TokenType.TAG_NAME) {
      if(isAlphaNumeric(k)) {
        currentNode.nodeName += k
      } else if(isEmptyContent(k)) {
        state = TokenType.BEFORE_ATTRIBUTE_NAME
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
        stacks.pop()
        state = TokenType.DATA
      }
    } else if(state === TokenType.BEFORE_ATTRIBUTE_NAME) {
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
        state = TokenType.BEFORE_ATTRIBUTE_NAME
      } else if(k === '>') {
        state = TokenType.DATA
      }
    }
  }
  return root
}

function isAlphaNumeric(s) {
  return /[A-Za-z0-9]/.test(s);
}

function isEmptyContent(s) {
  return /[\s\n\t\f]/.test(s);
}


const htmlString = `<div attr="attrValue">
  <h3>标题</h3>
  <div>文本内容</div>
</div>`;
console.log(parseHtml(htmlString))