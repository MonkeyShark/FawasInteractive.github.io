===
title: Modder Fodder (Clown Clear)
date: December 17, 2022
time: (8:05 PM EST)
tags: News & Dev
thumbnail: /images/Blogs/Thumbnails/ModderFodder.png
===

Hola, payaso enthuasticos. Today’s blog is all about mod support and how I plan (or hope) to incorporate it in *Clown Clear*. It should be said that these are currently just ideas and are subject to change before release, so please keep that in mind.

I would also like to mention that some of this may seem ramble-y, but the point is to explain my current thought process and how I plan on tackling it, and all of these ideas are solely coming from a few days worth of research — no physical testing has been done yet.

<h2 class="blog-subpage-header">Overall Goals</h2>
<hr>
To start off, there are three main components, or goals, that I’m keeping in mind while conceptualizing these systems: **freedom**, **ease of use**, and **consistency**. I explain these further below, but if you want to skip to the custom modifier & level editor information, just scroll down until you see the “Modifier Editor” heading.

<h4 class="blog-subpage-header">Freedom</h4>
Freedom is arguably the most important because it dictates how much the player is allowed to change. Some games feature simple mod support — allowing you to create alternate skins for characters or build levels with primitive editors. While this might be preferable for simpler games, more complex projects usually benefit from deeper modding tools — things like swapping out any model, texture, etc.

Currently I'm looking into a mix between the two extremes. While I'd love to give players ultimate freedom, implementing a system capable of importing and replacing assets in-game requires a significant amount of work. For now, I’m mostly focusing on built-in modifier and level editors, though everything is still subject to change.

<h4 class="blog-subpage-header">Ease of Use</h4>
Ease of use is another very important component since it opens modding to a lot more people. Unfortunately, more freedom usually equates to less ease of use, but it's still possible to organize everything in a way that balances it out.

As such, I’ve been working on some very early concepts for the modifier and level editors, which I think strike a good balance — but again, it’s still a heavy work in progress.

<h4 class="blog-subpage-header">Consistency</h4>
Consistency (and organization in general, I guess) is the final component I’m going to mention. It might not be as obvious as the others, but it’s still something to consider.

My current plan is to have an overarching “Mods” menu, which contains every type of mod — with enable/disable buttons, mod info, and even a conflicting mods system. There might also be a required mods system in place for mod makers to assign maps to modifiers. Every variant of mod will be packaged and assigned to the main “Mods” menu, but enabled mods will also appear in their respective categories.

<h2 class="blog-subpage-header">Modifier Editor</h2>
<hr>
I’m not sure how much information I've given on the "Modifier" system already, but in short — they’re kind of like “mini-game modes”, comparable to “Mutations” in Left 4 Dead. I’m hoping for these to be created by players through a simple editor showing a huge variety of variables and categories.

For example, if you wanted to create a modifier that changes gameplay to feel more like Left 4 Dead, you could toggle a check which disables aim down sights, change the properties for each weapon to have less hip-fire spread, modify enemy and player walk speeds, and disable spawning for certain types of weapons.

Having multiple categories and sub-categories for each feature might be the best way of keeping this system organized, but I have yet to come up with a perfect solution.

<h2 class="blog-subpage-header">Level Editor</h2>
<hr>
A level editor is something I’ve been especially considering recently, but would require a lot more work than the custom modifiers. If I were to implement one, it’d probably be fairly simple, but still flexible enough for player-generated maps comparable to the official ones.

The current method would be a lot simpler than something like Valve’s “Hammer” editor, but it’d still contain essential features like placing props, items, and mission objects, along with lighting settings, room creation, and hopefully terrain editing.

The most difficult aspect of this seems to relate to how the map data will actually be saved — it needs to store every prop, item, etc., along with all of the settings. I haven’t actually worked on this in-engine yet, so it could be startlingly easy or horrifically painful — it really just depends.

<h2 class="blog-subpage-header">Conclusion</h2>
<hr>
In conclusion, adding mod support is quite the undertaking, but since I love seeing the cool things players have made for other games (and as a part-time modder myself), I’m really trying to get it right — hopefully preventing people from needing to dissect the entire program just to have a medkit look like a spinning rat.

As always, I appreciate those of you who’ve read till the end. And for the ones who’d like to join a meticulously-crafted safehouse filled with nice, welcoming survivors, my Discord is always open! Join here:  
[https://discord.com/invite/BGg7pRxaUe   ](https://discord.com/invite/BGg7pRxaUe )
