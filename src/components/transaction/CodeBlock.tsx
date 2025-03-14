const CodeBlock: React.FC<{ content: string; className?: string }> = ({
  content,
  className = 'border-white/10',
}) => (
  <div className={`rounded-md border ${className} overflow-hidden`}>
    <pre className='bg-black/50 p-4 text-white overflow-x-auto'>{content}</pre>
  </div>
);

export default CodeBlock;
