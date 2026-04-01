const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { useChat } = require('@ai-sdk/react');

function TestComponent() {
  const chat = useChat();
  console.log("KEYS:", Object.keys(chat).join(", "));
  return React.createElement('div', null, 'test');
}

ReactDOMServer.renderToString(React.createElement(TestComponent));
