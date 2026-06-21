# Klaviyo Email & SMS Flows — Piece of Stass

> Email tone: feel like a text from a friend with great taste. One idea per send, one primary CTA, 1–2 emoji max. SMS ≤160 char including the "Reply STOP" where required. No brand names, no dupe/replica language, no fake scarcity unless literally true. Use `{firstName}`, `{product}`, `{cartItems}`, `{discountCode}` tokens.
> Each email: 5 subject-line variants for A/B, preview text, full body, CTA. SMS where applicable.

---

# FLOW 1 — WELCOME (3 emails)

## Welcome Email 1 — The 10% + the intro (send: immediately)
**Subject A/B:**
1. Your 10% is here — go raid the stash 🔖
2. Welcome to the stash (here's 10% off)
3. You're in. Here's 10% to prove it.
4. The look for less starts now — 10% inside
5. {firstName}, your stash is open

**Preview text:** Your code's inside, plus the finds everyone's stashing right now.

**Body:**
> Hi {firstName},
>
> Welcome to the stash. Here's the deal: I find the looks worth having, then track down the versions you can actually afford. You get the taste, not the price tag.
>
> To kick things off, here's **10% off your first raid.**
>
> **Code: {discountCode}**
>
> No minimums, no catch. Just the look for less, dropped daily.
>
> See you in the stash,
> Anna

**CTA:** Use my 10%

**SMS variant (149 char):** Welcome to Piece of Stass, {firstName}! Here's 10% off your first raid: {discountCode}. The look for less, dropped daily. Shop: {link} Reply STOP to opt out.

---

## Welcome Email 2 — The "how I curate" story (send: +2 days, if no purchase)
**Subject A/B:**
1. Why we don't sell everything
2. The secret to looking expensive
3. How I pick what makes the stash
4. We did the scrolling so you don't have to
5. Taste, not the price tag — here's how

**Preview text:** Curation is the whole product. Let me show you what that means.

**Body:**
> Hi {firstName},
>
> Quick truth: most stores sell everything and hope something sticks. We don't. We sell the edit — the pieces that already passed the group-chat test.
>
> That means quiet-luxury watches, the tote that ends the tote search, the runner all over your FYP. Expensive-looking, not expensive. That's the whole point.
>
> Your 10% is still good. Go find your first one.

**CTA:** Shop the edit

---

## Welcome Email 3 — Last call on the 10% (send: +4 days, if no purchase)
**Subject A/B:**
1. Your 10% is about to clock out
2. Don't leave your 10% on the table
3. Last call: 10% off your first raid
4. This is your reminder (10% inside)
5. {firstName}, the code expires soon

**Preview text:** Your welcome discount's almost up. The stash isn't going anywhere, but the code is.

**Body:**
> Hi {firstName},
>
> Not here to nag — just a heads-up that your **10% off** is about to expire. No pressure, but the first find always hits different.
>
> **Code: {discountCode}**
>
> Whenever you're ready, the stash is open.

**CTA:** Claim it before it's gone

**SMS variant (137 char):** {firstName}, your 10% off is about to expire! Code {discountCode}. The stash is open: {link} Reply STOP to opt out.

---

# FLOW 2 — ABANDONED CART (3 emails)

## Cart Email 1 — The gentle nudge (send: +1 hour)
**Subject A/B:**
1. You left something in your bag 👀
2. Your {product} is still waiting
3. Don't worry, we saved your bag
4. Forget something? It's still here.
5. Your stash, on hold

**Preview text:** Your picks are saved — but the good stuff doesn't wait forever.

**Body:**
> Hi {firstName},
>
> You've got great taste — your bag proves it. We saved your picks so you don't have to hunt them down again.
>
> {cartItems}
>
> Pick up right where you left off.

**CTA:** Back to my bag

**SMS variant (134 char):** {firstName}, you left great taste in your bag. We saved it for you: {link} The look for less is still waiting. Reply STOP to opt out.

---

## Cart Email 2 — Handle the objection (send: +24 hours)
**Subject A/B:**
1. Still thinking it over?
2. Here's why it's worth it
3. Your bag + everything you should know
4. The honest answer to "should I?"
5. About that {product}…

**Preview text:** Free returns, pay in 4, and a price that makes the decision easy.

**Body:**
> Hi {firstName},
>
> Still on the fence? Totally fair. Here's the no-pressure rundown:
>
> - **Easy 30-day returns** — changed your mind? No drama.
> - **Pay in 4** — split it with Klarna or Afterpay.
> - **The look for less** — expensive-looking, real-life price.
>
> Your bag's still saved. The decision's easier than you think.

**CTA:** Finish checking out

---

## Cart Email 3 — The incentive + close (send: +48 hours)
**Subject A/B:**
1. Okay, here's 10% to seal it
2. A little something to help you decide
3. 10% off your bag — last nudge
4. Your bag + 10% = done deal
5. We'll meet you halfway (10% inside)

**Preview text:** Last reminder on your bag, with 10% off to make it official.

**Body:**
> Hi {firstName},
>
> Last little nudge — and this time with a treat. Here's **10% off** to bring your picks home.
>
> {cartItems}
>
> **Code: {discountCode}**
>
> After this we'll stop texting, promise. The stash will be here whenever you're ready.

**CTA:** Get 10% off my bag

**SMS variant (151 char):** {firstName}, here's 10% off the bag you saved: {discountCode}. Bring your picks home before they sell out: {link} Reply STOP to opt out.

---

# FLOW 3 — BROWSE ABANDONMENT (2 emails)

## Browse Email 1 — The "saw you looking" (send: +4 hours)
**Subject A/B:**
1. Caught you eyeing the {product} 👀
2. Still thinking about {product}?
3. That one you keep looking at…
4. We saw what you liked
5. Your FYP, but shoppable

**Preview text:** No pressure — just the piece you were eyeing, right where you left it.

**Body:**
> Hi {firstName},
>
> Saw you eyeing the {product}. Good eye — it's one of my favorites in the stash right now.
>
> Want a closer look? It's right here, no commitment.

**CTA:** Take another look

---

## Browse Email 2 — The "more like it" (send: +24 hours)
**Subject A/B:**
1. More where that came from
2. If you liked that, you'll love these
3. We pulled a few more for you
4. The rest of the edit
5. Hand-picked, just for your taste

**Preview text:** A few more finds in the same vibe — curated, never cluttered.

**Body:**
> Hi {firstName},
>
> Still thinking about that {product}? Here are a few more from the same corner of the stash — same energy, same look-for-less price.
>
> {recommendedProducts}
>
> Curated, never cluttered. Find the one.

**CTA:** Shop the edit

---

# FLOW 4 — POST-PURCHASE (3 emails)

## Post Email 1 — Order confirmation (send: immediately)
> Mirrors transactional confirmation in `cart-checkout.md`. Use that body. Subject below.

**Subject A/B:**
1. Order #{orderNumber} confirmed — stash locked in 🔖
2. We've got your order, {firstName}
3. Consider it stashed
4. Your order's confirmed (here's what's next)
5. Boom — order #{orderNumber} is in

**Preview text:** Here's everything you grabbed and exactly what happens next.

**CTA:** Track your order

---

## Post Email 2 — Shipped (send: on fulfillment)
**Subject A/B:**
1. Your stash is on the move 📦
2. Good news — it shipped
3. {firstName}, your order's en route
4. On its way to you now
5. Tracking's live for order #{orderNumber}

**Preview text:** Your tracking link's inside. The wait is officially the good kind.

**Body:**
> Hi {firstName},
>
> Your order just left the stash — it's officially on the way to you.
>
> **Tracking:** {trackingLink}
>
> Quick reminder: it ships from our global warehouse, so allow 10–20 business days from order date. That short wait is exactly how we keep the price this low. Worth it — promise.
>
> We'll let you know when it lands.

**CTA:** Track my order

**SMS variant (144 char):** {firstName}, your order shipped! Track it here: {trackingLink} Allow 10-20 business days from order date. Reply STOP to opt out.

---

## Post Email 3 — Delivered + review request (send: +3 days after delivery)
**Subject A/B:**
1. It's here — now show us 👀
2. How'd we do, {firstName}?
3. Did it live up to the hype?
4. Rate your raid (60 seconds, tops)
5. The compliments started yet?

**Preview text:** Tell us how it landed — your honest take helps the next shopper.

**Body:**
> Hi {firstName},
>
> Your {product} should've landed by now. The real question: are the compliments rolling in yet?
>
> If you've got 60 seconds, drop us a review. Your honest take helps the next person find their one — and we read every single one.
>
> P.S. Tag #RaidTheStash and you might land on our homepage.

**CTA:** Leave a review

**SMS variant (139 char):** {firstName}, hope your {product} landed! Got 60 sec? Rate your raid here: {reviewLink} Your take helps the next shopper. Reply STOP to opt out.

---

# FLOW 5 — WIN-BACK (2 emails)

## Win-back Email 1 — The "we miss you" (send: 60 days no purchase)
**Subject A/B:**
1. The stash misses you 🫶
2. It's been a minute, {firstName}
3. New finds since you've been gone
4. Your taste called — it wants the stash
5. Come see what dropped

**Preview text:** A lot's landed since your last visit. Here's what you missed.

**Body:**
> Hi {firstName},
>
> It's been a minute, and the stash has been busy. New drops, new finds, same look-for-less energy you came for.
>
> Here's a peek at what's new. Your taste is going to want a word.

**CTA:** See what's new

---

## Win-back Email 2 — The comeback offer (send: +5 days, if still no purchase)
**Subject A/B:**
1. Okay, here's 15% to come back
2. A welcome-back treat, just for you
3. 15% off — because we miss your taste
4. Your comeback discount's inside
5. One more reason to raid the stash

**Preview text:** 15% off your next raid. No catch, just a nudge.

**Body:**
> Hi {firstName},
>
> Let's make this easy. Here's **15% off** your next raid — our way of saying come back and see what you've been missing.
>
> **Code: {discountCode}**
>
> The stash is fuller than ever. Your move.

**CTA:** Claim 15% off

**SMS variant (132 char):** {firstName}, we miss your taste. Here's 15% off your comeback: {discountCode}. See what's new: {link} Reply STOP to opt out.

---

# FLOW 6 — BIRTHDAY (1 email)

## Birthday Email — The treat (send: on birthday)
**Subject A/B:**
1. Happy birthday — treat's on us 🎉
2. It's your day. Here's 20% off.
3. {firstName}, go raid the stash on us
4. A birthday gift with your name on it
5. Birthday math: you + 20% off

**Preview text:** Happy birthday from the stash — here's something to spend it on.

**Body:**
> Happy birthday, {firstName}!
>
> You deserve a little something, so here it is: **20% off** anything in the stash, just for you. No minimum, no overthinking.
>
> **Code: {discountCode}**
>
> Go treat yourself to the look for less. Birthday rules say you have to.
>
> Cheers to you,
> Anna

**CTA:** Treat myself

**SMS variant (128 char):** Happy birthday, {firstName}! 🎉 Here's 20% off the whole stash, on us: {discountCode}. Treat yourself: {link} Reply STOP to opt out.
