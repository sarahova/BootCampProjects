# 8 SQL Alchemy - Bootcamp Assignment

## Background

Web scraping blew my mind! Suddenly, all the data on the internet was at my disposible. But I quickly learned about some hurdles which I'll go into below. This assignment was to use Beautiful Soup to scape the latest information on Mars, and use Python Flask to present the information on a webpage (refer to mission-to-mars.ipynb). We also had to learn the NoSQL database Mongo DB.

### Step 1 - Mars News

Scrape the [NASA Mars News Site](https://mars.nasa.gov/news/) and collect the latest News Title and Paragraph Text. Assign the text to variables that you can reference later.

The hurdle here was that requests was not working on getting the latest Mars News article. And it was because the webpage (html code) was rendered through javascript, so request.get could not pull html code that did not exist yet (i.e. one has to load the page first).

I tried several things:

* First, I tried fake_useragent from the UserAgent library, and tried ua=UserAgent() and used ua.chrome to fake a user and then I put that ua in a header string and passed it as an argument in my request.get (e.g. request.get(url, headers=ua)). But that didn't work.

* Second, I used splinter and chrome driver to do a browser.visit to render the page before I started parsing. SUCCESS!

Splinter got me thinking about other problems it could be used to solve. And the first thing that came to mind was a website where you scroll to the bottom to load more content. For this assignment, we only had to get the latest news story, but [NASA Mars News Site](https://mars.nasa.gov/news/) has a `More` button at the bottom of the page to get more News stories. As a side exercise, I wanted to use splinter to press the `More` button as many times it appears to scrape all news stories. See `AllNewsScrape.ipynb` to see how I did it.

### Step 2 - Featured Image 

Visit the url for JPL Featured Space Image [here](https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars). This image changes every 5-10 min. If a user were to refresh the end product (Flask App), the featured image is supposed to be updated based on what the featured image in real time.

This step I did with and without splinter.


### Step 3 - Mars Weather

Visit the Mars Weather twitter account [here](https://twitter.com/marswxreport?lang=en) and scrape the latest Mars weather tweet from the page. 

### Step 4 - Mars Facts

Visit the Mars Facts webpage [here](http://space-facts.com/mars/) and scrape the table containing facts about the planet including Diameter, Mass, etc.

For this, I used pd.read_html (pandas html parser which detects html table tags).

### Step 5 - Mars Hemispheres

Visit the USGS Astrogeology site [here](https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars) to obtain high resolution images for each of Mar's hemispheres.

So when I was doing this assignment, The US had its government shutdown and one of the consequences was that NASA websites were not operational. So I found another website [here](http://www.planetary.org/blogs/guest-blogs/bill-dunford/20140203-the-faces-of-mars.html) that I could scrape to acquire pictures of Mars' hemispheres.

### Step 6 - Load into MongoDB

* Use PyMongo to load information into MondoDB. I set it up, so that if a new scrape is performed, the latest information will overwrite the previous information on Mongo DB.

### Step 7 - Flask App (Optional)

Refer to MarsApp folder. I created 2 routes:

* '/' : renders index.html template

* '/scrape' : renders latest scraped Mars data. This was my API layer. I set it up so that it jsonified all the scraped data from above. I removed the Mars News section because I did not want the user to have to launch a seperate chromedriver whenever the '/scrape' route was called to be able to get information. It would just slow things down.


### Copyright

Coding Boot Camp © 2018. All Rights Reserved.
