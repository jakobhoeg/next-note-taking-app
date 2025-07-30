import React from "react";

import { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

interface CustomMarkdownProps {
  children: string;
}

const createMarkdownComponents = (): Partial<Components> => ({
  p: ({ children }) => (
    <p className="text-base font-light text-left leading-6 pb-4">
      {children}
    </p>
  ),
  hr: ({ }) => <hr className="pb-4" />,
  pre: ({ children }) => <>{children}</>,
  img: ({ children, ...props }) => {
    return <img className="max-w-full rounded-lg" {...props} />;
  },
  ol: ({ children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ children, ...props }) => {
    return (
      <a
        className="text-blue-300 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ children, ...props }) => {
    const text =
      typeof children === "string"
        ? children
        : React.Children.toArray(children).join("");
    const anchor = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h1
        id={anchor}
        className="text-xl md:text-2xl font-semibold text-left mb-1 leading-tight"
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    const text =
      typeof children === "string"
        ? children
        : React.Children.toArray(children).join("");
    const anchor = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h2
        id={anchor}
        className="text-lg md:text-xl text-left font-semibold mb-1 leading-tight"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const text =
      typeof children === "string"
        ? children
        : React.Children.toArray(children).join("");
    const anchor = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h3
        id={anchor}
        className="text-base md:text-lg text-left mb-1 leading-tight"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    return (
      <h4
        className="text-base text-left mb-1 leading-tight"
        {...props}
      >
        {children}
      </h4>
    );
  },
  h5: ({ children, ...props }) => {
    return (
      <h5
        className="text-sm text-left mb-1 leading-tight"
        {...props}
      >
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }) => {
    return (
      <h6
        className="text-xs text-left mb-1 leading-tight"
        {...props}
      >
        {children}
      </h6>
    );
  },
  table: ({ children, ...props }) => {
    return (
      <div className="w-full overflow-auto">
        <table
          className="w-full text-sm text-left border-collapse my-4 rounded-lg overflow-hidden"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  thead: ({ children, ...props }) => {
    return (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    );
  },
  th: ({ children, ...props }) => {
    return (
      <th
        className="px-4 py-2 font-semibold text-foreground border-b border-border"
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ children, ...props }) => {
    return (
      <td className="px-4 py-2 border-b border-border" {...props}>
        {children}
      </td>
    );
  },
  tr: ({ children, ...props }) => {
    return (
      <tr className="hover:bg-accent transition-colors" {...props}>
        {children}
      </tr>
    );
  },
});

export const CustomMarkdown: React.FC<CustomMarkdownProps> = ({ children }) => {
  const components = createMarkdownComponents();
  // TODO: Consider sanitizing HTML output for security if user input is rendered
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};
