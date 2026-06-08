import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-gold text-gold-foreground">
                <Recycle className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-black uppercase">
                Comeback × Goodwill
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-primary-foreground/75 leading-relaxed">
              A direct-from-returns inventory program built for nonprofit thrift
              retailers. Less landfill. Better margins. More jobs at home.
            </p>
          </div>
          <div>
            <p className="font-display font-bold uppercase text-sm mb-3 text-gold">Explore</p>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/catalog" className="hover:text-gold">Catalog</Link></li>
              <li><Link to="/impact" className="hover:text-gold">Our Impact</Link></li>
              <li><Link to="/how-it-works" className="hover:text-gold">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display font-bold uppercase text-sm mb-3 text-gold">Get in touch</p>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="mailto:nonprofits@comebackgoods.com" className="hover:text-gold">nonprofits@comebackgoods.com</a></li>
              <li><Link to="/contact" className="hover:text-gold">Request a quote</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Comeback Goods. Built for thrift.</p>
          <p>Not affiliated with Goodwill Industries International. Branding shown for partner outreach.</p>
        </div>
      </div>
    </footer>
  );
}
