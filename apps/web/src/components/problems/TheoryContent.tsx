import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.min.css'

interface TheoryContentProps {
  content: string
}

export default function TheoryContent({ content }: TheoryContentProps) {
  return (
    <div
      className="
        text-sm text-(--color-text-primary) leading-relaxed
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-(--color-text-primary)
        [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:text-(--color-text-primary)
        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-(--color-text-primary)
        [&_p]:mb-3 [&_p]:text-(--color-text-primary)
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul>li]:mb-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol>li]:mb-1
        [&_li]:text-(--color-text-primary)
        [&_code]:bg-black/25 [&_code]:text-(--color-accent) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
        [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre]:text-xs [&_pre]:!bg-[#0d1117]
        [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-4 [&_pre_code]:block
        [&_strong]:font-semibold [&_strong]:text-(--color-text-primary)
        [&_em]:italic [&_em]:text-(--color-text-secondary)
        [&_blockquote]:border-l-[3px] [&_blockquote]:border-(--color-accent) [&_blockquote]:pl-3 [&_blockquote]:text-(--color-text-secondary) [&_blockquote]:italic [&_blockquote]:my-3
        [&_hr]:border-(--color-border) [&_hr]:my-4
        [&_table]:w-full [&_table]:text-xs [&_table]:mb-3 [&_table]:border-collapse
        [&_th]:text-left [&_th]:px-2 [&_th]:py-1.5 [&_th]:border [&_th]:border-(--color-border) [&_th]:bg-(--color-bg) [&_th]:font-semibold
        [&_td]:px-2 [&_td]:py-1.5 [&_td]:border [&_td]:border-(--color-border)
        [&_a]:text-(--color-accent) [&_a]:underline [&_a]:underline-offset-2
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
