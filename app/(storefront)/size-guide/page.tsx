import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Size Guide | FLASH',
  description: 'Find your perfect fit with the FLASH size chart.',
}

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <article className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
          Size <span className="text-primary italic">Guide</span>
        </h1>
        
        <p className="lead text-muted-foreground">
          Find your perfect fit. Our pieces are designed for a relaxed, inclusive silhouette. If you prefer a more tailored look, consider sizing down.
        </p>

        <section>
          <h2>T-Shirts (Oversized Fit)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 border-b">Size</th>
                  <th className="py-2 border-b">Chest (inches)</th>
                  <th className="py-2 border-b">Length (inches)</th>
                  <th className="py-2 border-b">Shoulder (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">XS</td>
                  <td className="py-2 border-b">40</td>
                  <td className="py-2 border-b">26</td>
                  <td className="py-2 border-b">18</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">S</td>
                  <td className="py-2 border-b">42</td>
                  <td className="py-2 border-b">27</td>
                  <td className="py-2 border-b">19</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">M</td>
                  <td className="py-2 border-b">44</td>
                  <td className="py-2 border-b">28</td>
                  <td className="py-2 border-b">20</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">L</td>
                  <td className="py-2 border-b">46</td>
                  <td className="py-2 border-b">29</td>
                  <td className="py-2 border-b">21</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">XL</td>
                  <td className="py-2 border-b">48</td>
                  <td className="py-2 border-b">30</td>
                  <td className="py-2 border-b">22</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2>Hoodies</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 border-b">Size</th>
                  <th className="py-2 border-b">Chest (inches)</th>
                  <th className="py-2 border-b">Length (inches)</th>
                  <th className="py-2 border-b">Sleeve (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">S</td>
                  <td className="py-2 border-b">44</td>
                  <td className="py-2 border-b">26</td>
                  <td className="py-2 border-b">24</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">M</td>
                  <td className="py-2 border-b">46</td>
                  <td className="py-2 border-b">27</td>
                  <td className="py-2 border-b">25</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">L</td>
                  <td className="py-2 border-b">48</td>
                  <td className="py-2 border-b">28</td>
                  <td className="py-2 border-b">26</td>
                </tr>
                <tr>
                  <td className="py-2 border-b font-bold text-primary">XL</td>
                  <td className="py-2 border-b">50</td>
                  <td className="py-2 border-b">29</td>
                  <td className="py-2 border-b">27</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-muted/30 p-6 rounded-2xl mt-12 border border-border/50">
          <h3 className="mt-0 italic tracking-tight">How to measure?</h3>
          <p className="text-sm text-muted-foreground mb-0">
            <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.<br/>
            <strong>Length:</strong> Measure from the highest point of the shoulder down to the hem.<br/>
            <strong>Shoulder:</strong> Measure from one shoulder point to the other across the back.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground italic">
          Measurements are in inches and may have a +/- 0.5 inch tolerance.
        </div>
      </article>
    </div>
  )
}
