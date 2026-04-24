import Link from 'next/link';
import Image from 'next/image';
import { Phone, Clock, Mail } from 'lucide-react';

const locationGruops = [
  {
    state: 'California',
    cities: [
      { city: 'San Diego', href: '/inventory?location=san-diego-ca' },
      { city: 'West Sacramento', href: '/inventory?location=west-sacramento-ca' },
      { city: 'Fremont', href: '/inventory?location=fremont-ca' },
    ],
  },
  {
    state: 'Florida',
    cities: [
      { city: 'Davie', href: '/inventory?location=davie-fl' },
      { city: 'Orlando (Sanford)', href: '/inventory?location=orlando-sanford-fl' },
      { city: 'Port St. Lucie', href: '/inventory?location=port-st-lucie-fl' },
      { city: 'Ft. Myers', href: '/inventory?location=ft-myers-fl' },
    ],
  },
  {
    state: 'Arizona',
    cities: [
      { city: 'Phoenix', href: '/inventory?location=phoenix-az' },
      { city: 'Mesa', href: '/inventory?location=mesa-az' },
      { city: 'Tucson', href: '/inventory?location=tucson-az' },
    ],
  },
  {
    state: 'New Mexico',
    cities: [{ city: 'Albuquerque', href: '/inventory?location=albuquerque-nm' }],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="Van Live"
                width={160}
                height={32}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-secondary-foreground/60 mt-4 text-xs leading-relaxed">
              Note: not all Van brands are available at all Van Live locations. Prices subject to change without notice
              and all advertised prices exclude government fees and taxes, any finance charges, any dealer document
              processing charge ($85 in California; $1,495 in Florida, Arizona and New Mexico), any electronic filing
              charge ($195 in Florida; $35 in New Mexico), and any emission testing charge. Van lengths are not an exact
              measurement of the unit.
            </p>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-9">
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-wider uppercase">Contact Us</h3>
              <ul className="text-secondary-foreground/60 flex list-none flex-wrap items-center gap-x-8 gap-y-2 p-0 text-sm">
                <li>
                  <a href="tel:1-786-570-8584" className="hover:text-primary flex items-center gap-2 transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    (786) 570-8584
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@vanlive.io"
                    className="hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    info@vanlive.io
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Mon-Sat 9AM-6PM
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold tracking-wider uppercase">Locations</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
                {locationGruops.map(({ state, cities }) => (
                  <div key={state}>
                    <p className="text-secondary-foreground mb-2.5 text-sm font-bold">{state}</p>
                    <ul className="space-y-2">
                      {cities.map(({ city, href }) => (
                        <li key={city} className="text-secondary-foreground/70 text-sm leading-snug">
                          <Link href={href} className="hover:text-primary transition-colors">
                            {city}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-secondary-foreground/10 border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 text-xs md:flex-row md:justify-between md:px-6">
          <p className="text-secondary-foreground/40">
            &copy; {new Date().getFullYear()} Van Live. All rights reserved.
          </p>
          <p className="text-secondary-foreground/40">
            Powered by <span className="text-secondary-foreground/60 font-semibold">ViewPro</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
