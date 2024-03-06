import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    components={{
      h1(props) {
        return <h1 className="text-3xl font-bold">{props.children}</h1>;
      },
      h2(props) {
        return <h2 className="text-2xl font-bold">{props.children}</h2>;
      },
      h3(props) {
        return <h3 className="text-xl font-bold">{props.children}</h3>;
      },
      h4(props) {
        return <h4 className="text-lg font-bold">{props.children}</h4>;
      },
      h5(props) {
        return <h5 className="text-base font-bold">{props.children}</h5>;
      },
      h6(props) {
        return <h6 className="text-sm font-bold">{props.children}</h6>;
      },
      p(props) {
        return <p className="text-base">{props.children}</p>;
      },
      ul(props) {
        return <ul className="list-disc pl-4">{props.children}</ul>;
      },
      ol(props) {
        return <ol className="list-decimal pl-4">{props.children}</ol>;
      },
      li(props) {
        return <li className="text-base">{props.children}</li>;
      },
      blockquote(props) {
        return <blockquote className="text-base italic">{props.children}</blockquote>;
      },
      a(props) {
        return (
          <a className="text-blue-600 hover:underline" href={props.href as string}>
            {props.children}
          </a>
        );
      },
      code(props) {
        const { children, className, node, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
          // @ts-expect-error
          <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={oneDark}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code {...rest} className={className}>
            {children}
          </code>
        );
      },
    }}
  >
    {children}
  </ReactMarkdown>
);
