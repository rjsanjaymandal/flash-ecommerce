import { WithContext, FAQPage } from 'schema-dts'

interface FAQJsonLdProps {
    questions: {
        question: string
        answer: string
    }[]
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
    const jsonLd: WithContext<FAQPage> = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map(q => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
