// import React, { MouseEvent } from 'react'
// import { isMobile } from 'react-device-detect'
// import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
// import { useAppSelector } from '../../redux/hooks'
// import ICasinoMatch from '../../models/ICasinoMatch'
// import { useNavigateCustom } from '../_layout/elements/custom-link'
// import { toast } from 'react-toastify'
// const CasinoListItem = (props: any) => {
//   const gamesList = useAppSelector<any>(selectCasinoMatchList)
//   const navigate = useNavigateCustom()
//   const casinoWidth = isMobile ? 'col-3' : 'col11'

//   const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
//     e.preventDefault()
//     if (!Item.isDisable && Item.match_id!=-1 ) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
//       else toast.warn('This game is suspended by admin, please try again later')
//   }
//   return (
//     <>
//           {gamesList &&
//             gamesList
//             .filter((item: any) => !item.isDisable && item.match_id !== -1)
//             .map((Item: any, key: number) => {
//               return (
//                 <div className={"casino-list-item col-4"} key={key}>
//                   <a href='#' onClick={(e) => onCasinoClick(e, Item)} className=''>
//                       <div className="casino-list-item-banner" 
//                         style={{ backgroundImage: `url(${Item.image})`}}>
//                       </div>
//                       <div className='casino-list-name'>{Item.title}</div>
               
//                   </a>
//                 </div>
//               )
//             })}
//     </>
//   )
// }
// export default React.memo(CasinoListItem)



// import React, { MouseEvent } from 'react'
// import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
// import { useAppSelector } from '../../redux/hooks'
// import ICasinoMatch from '../../models/ICasinoMatch'
// import { useNavigateCustom } from '../_layout/elements/custom-link'
// import { toast } from 'react-toastify'


// const CasinoListItem = (props: any) => {
//   const gamesList = useAppSelector<any>(selectCasinoMatchList)
//   const navigate = useNavigateCustom()

//   const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
//     e.preventDefault()
//     if (!Item.isDisable && Item.match_id != -1) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
//     else toast.warn('This game is suspended by admin, please try again later')
//   }

//   return (
//     <div className="chub-grid">
//       {gamesList &&
//         gamesList
//           .filter((item: any) => !item.isDisable && item.match_id !== -1)
//           .map((Item: any, key: number) => {
//             return (
//               <div className="chub-card" key={key}>
//                 <a href="#" onClick={(e) => onCasinoClick(e, Item)} className="chub-link">
//                   <div className="chub-img-wrap">
//                     <img
//                       src={Item.image}
//                       alt={Item.title}
//                       className="chub-img"
//                       loading="lazy"
//                     />
//                   </div>
//                   <div className="chub-title">{Item.title}</div>
//                 </a>
//               </div>
//             )
//           })}
//     </div>
//   )
// }
// export default React.memo(CasinoListItem)

// import React, { MouseEvent, useMemo, useState } from 'react'
// import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
// import { useAppSelector } from '../../redux/hooks'
// import ICasinoMatch from '../../models/ICasinoMatch'
// import { useNavigateCustom } from '../_layout/elements/custom-link'
// import { toast } from 'react-toastify'

// // Category definitions — "match" holds keyword(s) checked against the
// // game title (lowercased) to decide which category a game belongs to.
// const CATEGORIES = [
//   { key: 'all', label: 'All', match: [] as string[] },
//   { key: 'crash', label: 'Crash', match: ['crash', 'aviator'] },
//   { key: 'teenpatti', label: 'Teenpatti', match: ['teenpatti', 'teen patti'] },
//   { key: 'lucky7', label: 'Lucky7', match: ['lucky 7', 'lucky7'] },
//   { key: 'dragontiger', label: 'Dragon Tiger', match: ['dragon tiger'] },
//   { key: '32card', label: '32 Card', match: ['32 card', 'card 32', '32cards'] },
//   { key: 'poker', label: 'Poker', match: ['poker'] },
//   { key: 'andarbahar', label: 'Andar Bahar', match: ['andar bahar', 'andar bhar'] },
// ]

// // A unique, unlikely-to-collide prefix. Every rule below uses !important
// // so it wins even against legacy/template CSS that also uses !important.
// const P = 'cbz2026'

// const CasinoListItem = (props: any) => {
//   const gamesList = useAppSelector<any>(selectCasinoMatchList)
//   const navigate = useNavigateCustom()
//   const [activeCategory, setActiveCategory] = useState('all')

//   const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
//     e.preventDefault()
//     if (!Item.isDisable && Item.match_id != -1) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
//     else toast.warn('This game is suspended by admin, please try again later')
//   }

//   const visibleGames = useMemo(() => {
//     if (!gamesList) return []
//     const base = gamesList.filter((item: any) => !item.isDisable && item.match_id !== -1)

//     if (activeCategory === 'all') return base

//     const category = CATEGORIES.find((c) => c.key === activeCategory)
//     if (!category || category.match.length === 0) return base

//     return base.filter((item: any) => {
//       const title = (item.title || '').toLowerCase()
//       return category.match.some((keyword) => title.includes(keyword))
//     })
//   }, [gamesList, activeCategory])

//   return (
//     <div className={`${P}-root`}>
//       {/* Scoped stylesheet — !important beats any legacy/template CSS,
//           and the "cbz2026" prefix avoids colliding with existing classes */}
//       <style>{`
//         .${P}-tabs {
//           display: flex !important;
//           align-items: center !important;
//           gap: 6px !important;
//           overflow-x: auto !important;
//           white-space: nowrap !important;
//           background: #020421 !important;
//           padding: 10px !important;
//           margin: 0 !important;
//           list-style: none !important;
//           width:100vw;
//         }
//         .${P}-tab {
//           flex: 0 0 auto !important;
//           border: none !important;
//           font-size: 13px !important;
//           font-weight: 600 !important;
//           padding: 7px 16px !important;
//           border-radius: 18px !important;
//           cursor: pointer !important;
//           background: transparent !important;
//           color: #cfd8e3 !important;
//         }
//         .${P}-tab-active {
//           background: #ffffff !important;
//           color: #020421 !important;
//         }
//         .${P}-grid {
//           display: grid !important;
//           grid-template-columns: repeat(3, 1fr) !important;
//           gap: 10px !important;
//           padding: 10px !important;
//           box-sizing: border-box !important;
//           margin: 0 !important;
//           list-style: none !important;
//         }
//         .${P}-card {
//           width: 100% !important;
//           max-width: 100% !important;
//           margin: 0 !important;
//           padding: 0 !important;
//         }
//         .${P}-link {
//           display: block !important;
//           text-decoration: none !important;
//           border-radius: 8px !important;
//           overflow: hidden !important;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
//           background: #020421 !important;
//         }
//         /* padding-bottom trick = forces a perfect square box on every
//            browser, even old ones that don't support aspect-ratio */
//         .${P}-imgwrap {
//           position: relative !important;
//           width: 100% !important;
//           height: 0 !important;
//           padding-bottom: 105% !important;
//           overflow: hidden !important;
//           background: #1a3a63 !important;
//         }
//         .${P}-img {
//           position: absolute !important;
//           top: 0 !important;
//           left: 0 !important;
//           width: 100% !important;
//           height: 100% !important;
//           max-width: 100% !important;
//           object-fit: cover !important;
//           display: block !important;
//           margin: 0 !important;
//         }
//         .${P}-title {
//           background: #020421 !important;
//           color: #fff !important;
//           text-align: center !important;
//           font-size: 11.5px !important;
//           font-weight: 600 !important;
//           padding: 6px 4px !important;
//           line-height: 1.25 !important;
//           min-height: 32px !important;
//           margin: 0 !important;
//         }
//       `}</style>

//       {/* CATEGORY SCROLLER */}
//       <div className={`${P}-tabs`}>
//         {CATEGORIES.map((cat) => (
//           <button
//             key={cat.key}
//             className={`${P}-tab ${activeCategory === cat.key ? `${P}-tab-active` : ''}`}
//             onClick={() => setActiveCategory(cat.key)}
//           >
//             {cat.label}
//           </button>
//         ))}
//       </div>

//       {/* GAME GRID — 3 per row, guaranteed via !important */}
//       <div className={`${P}-grid`}>
//         {visibleGames.map((Item: any, key: number) => {
//           return (
//             <div className={`${P}-card`} key={key}>
//               <a href="#" onClick={(e) => onCasinoClick(e, Item)} className={`${P}-link`}>
//                 <div className={`${P}-imgwrap`}>
//                   <img
//                     src={Item.image}
//                     alt={Item.title}
//                     className={`${P}-img`}
//                     loading="lazy"
//                   />
//                 </div>
//                 <div className={`${P}-title`}>{Item.title}</div>
//               </a>

//             </div>
//           )
//         })}

//           <a href="/match/matka"  className={`${P}-link`}>
//                 <div className={`${P}-imgwrap`}>
//                   <img
//                     src="https://sixrun.co/assets/matka_new-CYM3bRoj.png"
                  
//                     className={`${P}-img`}
//                     loading="lazy"
//                   />
//                 </div>
//                 <div className={`${P}-title`}>matka</div>
//               </a>
//       </div>
//     </div>
//   )
// }
// export default React.memo(CasinoListItem)




import React, { MouseEvent, useMemo, useState } from "react";
import { selectCasinoMatchList } from "../../redux/actions/casino/casinoSlice";
import { useAppSelector } from "../../redux/hooks";
import ICasinoMatch from "../../models/ICasinoMatch";
import { useNavigateCustom } from "../_layout/elements/custom-link";
import { toast } from "react-toastify";
import "./newcitem2.css";

/* =========================================
   TYPES
========================================= */

interface CasinoBanner {
  id: string;
  title: string;
  image: string;
  url: string;
}

/* =========================================
   ALL STATIC JSON DATA
   Images aur URLs yahin change karna
========================================= */

const CASINO_HOME: {
  featured: CasinoBanner[];
  providers: CasinoBanner[];
  favourites: CasinoBanner[];
} = {
  // TOP 6 BANNERS
  featured: [
    {
      id: "lightning",
      title: "Lightning",
      image: "https://bethub24pro.com/assets/img/casino-banners/lightning.gif",
      url: "",
    },
    {
      id: "marble-run",
      title: "Marble Run",
      image: "https://bethub24pro.com/assets/img/casino-banners/marble-run.gif",
      url: "",
    },
    {
      id: "sexy",
      title: "Sexy",
      image: "https://bethub24pro.com/assets/img/casino-banners/sexy.gif",
      url: "",
    },
    {
      id: "aviator",
      title: "Aviator",
      image: "https://bethub24pro.com/assets/img/casino-banners/mines.gif",
      url: "",
    },
    {
      id: "mines",
      title: "Mines",
      image: "https://bethub24pro.com/assets/img/casino-banners/mines.gif",
      url: "",
    },
    {
      id: "bikini",
      title: "Bikini Games",
      image: "https://bethub24pro.com/assets/img/casino-banners/bickny-game.gif",
      url: "",
    },
  ],

  // OUR PROVIDERS
  providers: [
    {
      id: "diamond",
      title: "Diamond Casino",
      image: "https://bethub24pro.com/assets/img/providers/banners-diamond.jpeg",
      url: "",
    },
    {
      id: "mac88-virtual",
      title: "MAC88 Virtual Games",
      image: "https://bethub24pro.com/assets/img/providers/mac88-virtual-game.webp",
      url: "",
    },
    {
      id: "mac88-casino",
      title: "MAC88 Casino",
      image: "https://bethub24pro.com/assets/img/providers/casino.webp",
      url: "",
    },
    {
      id: "mac-excite",
      title: "MAC Excite",
      image: "https://bethub24pro.com/assets/img/providers/max-excite.webp",
      url: "",
    },
  ],

  // MY FAVOURITES

favourites: [
  {
    id: "cricket-10-10",
    title: "10-10 Cricket",
    image: "/imgs/10_10_cricket.webp",
    url: "",
  },
  {
    id: "poker-20-20",
    title: "20-20 Poker",
    image: "/imgs/20_20_poker.webp",
    url: "",
  },
  {
    id: "29b",
    title: "29B",
    image: "/imgs/29b.webp",
    url: "",
  },
  {
    id: "32-cards",
    title: "32 Cards",
    image: "/imgs/32_cards.webp",
    url: "",
  },
  {
    id: "amar-akbar-anthony",
    title: "Amar Akbar Anthony",
    image: "/imgs/amar_akbar_anthony.webp",
    url: "",
  },
  {
    id: "andar-bahar",
    title: "Andar Bahar",
    image: "/imgs/andar_bahar.webp",
    url: "",
  },
  {
    id: "baccarat-mac88",
    title: "Baccarat MAC88",
    image: "/imgs/baccarat_mac88.webp",
    url: "",
  },
  {
    id: "baccarat-one-day",
    title: "Baccarat One Day",
    image: "/imgs/baccarat_one_day.webp",
    url: "",
  },
  {
    id: "casino-war",
    title: "Casino War",
    image: "/imgs/casino_war.webp",
    url: "",
  },
  {
    id: "cc",
    title: "CC",
    image: "/imgs/cc.webp",
    url: "",
  },
  {
    id: "dt-1day",
    title: "Dragon Tiger 1 Day",
    image: "/imgs/dt_1day.webp",
    url: "",
  },
  {
    id: "dt-mac88",
    title: "Dragon Tiger MAC88",
    image: "/imgs/dt_mac88.webp",
    url: "",
  },
  {
    id: "dtl-20-20",
    title: "Dragon Tiger 20-20",
    image: "/imgs/dtl_20_20.webp",
    url: "",
  },
  {
    id: "high-low",
    title: "High Low",
    image: "/imgs/high_low.webp",
    url: "",
  },
  {
    id: "lottery",
    title: "Lottery",
    image: "/imgs/lottery.webp",
    url: "",
  },
  {
    id: "lucky15",
    title: "Lucky 15",
    image: "/imgs/lucky15.webp",
    url: "",
  },
  {
    id: "lucky7",
    title: "Lucky 7",
    image: "/imgs/lucky_7.webp",
    url: "",
  },
  {
    id: "race20",
    title: "Race 20",
    image: "/imgs/race_20.webp",
    url: "",
  },
  {
    id: "roulette-mac88",
    title: "Roulette MAC88",
    image: "/imgs/roulette_mac88.webp",
    url: "",
  },
  {
    id: "aviator",
    title: "Aviator X",
    image: "/imgs/sbe_aviator1.jpg",
    url: "",
  },
  {
    id: "sicbo-mac88",
    title: "Sic Bo MAC88",
    image: "/imgs/sicbo_mac88.webp",
    url: "",
  },
  {
    id: "super-over",
    title: "Super Over",
    image: "/imgs/super_over.webp",
    url: "",
  },
  {
    id: "tp1d",
    title: "Teenpatti 1 Day",
    image: "/imgs/tp1d.webp",
    url: "",
  },
  {
    id: "vr-poker",
    title: "VR Poker",
    image: "/imgs/vr_poker.webp",
    url: "",
  },
],

};

/* =========================================
   EXISTING CASINO CATEGORIES
========================================= */

const CATEGORIES = [
  { key: "all", label: "All", match: [] as string[] },
  { key: "crash", label: "Crash", match: ["crash", "aviator"] },
  {
    key: "teenpatti",
    label: "Teenpatti",
    match: ["teenpatti", "teen patti"],
  },
  { key: "lucky7", label: "Lucky7", match: ["lucky 7", "lucky7"] },
  {
    key: "dragontiger",
    label: "Dragon Tiger",
    match: ["dragon tiger"],
  },
  {
    key: "32card",
    label: "32 Card",
    match: ["32 card", "card 32", "32cards"],
  },
  { key: "poker", label: "Poker", match: ["poker"] },
  {
    key: "andarbahar",
    label: "Andar Bahar",
    match: ["andar bahar", "andar bhar"],
  },
];

/* =========================================
   MAIN COMPONENT
========================================= */

const CasinoListItem: React.FC = () => {
  const gamesList = useAppSelector(selectCasinoMatchList);
  const navigate = useNavigateCustom();

  const [activeCategory, setActiveCategory] = useState("all");

  /* EXISTING CASINO NAVIGATION */

  const onCasinoClick = (
    e: MouseEvent<HTMLAnchorElement>,
    item: ICasinoMatch
  ) => {
    e.preventDefault();

    if (!item.isDisable && item.match_id != -1) {
      navigate.go(`/casino/${item.slug}/${item.match_id}`);
    } else {
      toast.warn(
        "This game is suspended by admin, please try again later"
      );
    }
  };

  /* STATIC BANNER NAVIGATION */

  const onBannerClick = (
    e: MouseEvent<HTMLAnchorElement>,
    item: CasinoBanner
  ) => {
    e.preventDefault();

    if (item.url) {
      navigate.go(item.url);
    } else {
      toast.info("Game link is not configured yet");
    }
  };

  /* EXISTING CATEGORY FILTER */

  const visibleGames = useMemo(() => {
    const base = (gamesList || []).filter(
      (item: ICasinoMatch) =>
        !item.isDisable && item.match_id !== -1
    );

    if (activeCategory === "all") return base;

    const category = CATEGORIES.find(
      (c) => c.key === activeCategory
    );

    if (!category || category.match.length === 0) {
      return base;
    }

    return base.filter((item: ICasinoMatch) => {
      const title = (item.title || "").toLowerCase();

      return category.match.some((keyword) =>
        title.includes(keyword)
      );
    });
  }, [gamesList, activeCategory]);

  /* REUSABLE BANNER RENDER */

  const renderBanner = (item: CasinoBanner) => (
    <a
      key={item.id}
      href={item.url || "#"}
      className="ch-banner"
      onClick={(e) => onBannerClick(e, item)}
      aria-label={item.title}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
      />
    </a>
  );

  return (
    <div className="ch-root">

      {/* =================================
          TOP FEATURED BANNERS - 3 COLUMNS
      ================================= */}

      <section className="ch-featured-grid">
        {CASINO_HOME.featured.map(renderBanner)}
      </section>

      {/* =================================
          OUR PROVIDERS - 2 COLUMNS
      ================================= */}

      <section className="ch-section">
        <h2 className="ch-heading">OUR PROVIDERS</h2>

        <div className="ch-provider-grid">
          {CASINO_HOME.providers.map(renderBanner)}
        </div>
      </section>

      {/* =================================
          MY FAVOURITES - 3 COLUMNS
      ================================= */}

      <section className="ch-section">
        <h2 className="ch-heading">MY FAVOURITES</h2>


         <div className="ch-games-grid">
          {visibleGames.map((item: ICasinoMatch) => (
            <a
              key={`${item.slug}-${item.match_id}`}
              href={`/casino/${item.slug}/${item.match_id}`}
              className="ch-game-card"
              onClick={(e) => onCasinoClick(e, item)}
            >
              <div className="ch-game-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />
              </div>

              <div className="ch-game-title">
                {item.title}
              </div>
            </a>
          ))}

          {/* EXISTING MATKA GAME */}

         
        </div>

        <div className="ch-favourites-grid">
          {CASINO_HOME.favourites.map((item) => (
            <a
              key={item.id}
              href={item.url || "#"}
              className="ch-favourite-card"
              onClick={(e) => onBannerClick(e, item)}
            >
              <div className="ch-favourite-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />
              </div>

              <div className="ch-favourite-title">
                {item.title}
              </div>
            </a>
          ))}
        </div>

      </section>



    </div>
  );
};

export default React.memo(CasinoListItem);
