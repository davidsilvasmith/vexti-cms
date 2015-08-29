# vexti

* TOC
{:toc}

***warning *** the code probably doesn't work right now (hardcoded paths) but I wanted to get this where someone else can look / modify

## About
Files about the project (largely prototyping docs from Startup Weekend)

At a high level the current implementation of Vexti is largely to be a better UX around Jekyll. 

Jekyll is an awesome database-less CMS. Unfortunately one has to be a dev to use it.

The first phase of this project is to make it a user friendly CMS.

Phase two is to make it a marketing platform.

## Hosting 
- the server code is hosted on a Liquid Web Server owned by Jordan Smith - A Liquid Web employee
- individual sites are hosted on github pages under my account: https://github.com/davidsilvasmith?tab=repositories they are static sites though and could be pushed anywhere.

## Server
This the server component. The server's job is threefold:
1) Serve the client UX (editor, plus not yet existing CMS interface to navigate projects, view dashboard, etc.)
2) Serve the client a preview of the rendered site before it is pushed live
3) Provide an API endpoint for client code to interface with
  - file based storage (save to the right spot, provide directory browsing services, etc.)
  - jekyll (complie site on save to give user a preview)
  - git (used for pushing the site live (github pages)
  - future - image compression / code optimization / etc.

 - files are in /dtw *(short for death to wordpress)*
 - I didn't know how to do routing well in Express (this is my first Node project) so a lot of the routes are in app.js and too much logic.)
     - the server expects to find jekyll websites in dtwPathRoot = '/Users/smithd98/apps/'; (specified in app.js)
 -/routes/index.js has most of the code for system funtions (yeah, sick naming. sorry :( )
   - /system/dir
   - /system/file
   - /system/git
   - walkInternal
   - walk 
-public/edit.html - this was the first editor (replaced by StackEdit)

## Client
 The client is a lightly modified StackEdit.
 
 StackEdit provides an extensible (although somewhat difficult) model. By default we get:
 - File editing
 - folder / file navigation
 - a save / publish architecture
 - an extensibility architecture
 
 Changes are designed to be as low impact as possible to make it easy to incorporate future changes.
 
 ### Light Changes
  - there have been deletions to hide irrelivent UI.
  - Most of the added code is in /public/res/dtw then some files are modified to pull these extensions.
  - dtwFrontMatterEditor.* - code for editing the Jekyll Front Matter
  - dtwImageUploader - code for uploading an image
  - dtwPublisher - code for moving a file out of draft and into staging
  - dtwPusher - code for pushing code live / giving a command line to the user
  
