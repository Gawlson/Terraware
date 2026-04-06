# Terraware

## What is Terraware
Terraware is a an easy to use tool that collects climate, endangered species, and wildfire data for the states in the United States and presents it in a digestible format with a simple card layout and interactible map.
## The Problem
A lack of data and information isn't the problem, understanding and awareness is. There exists a plethora of scientific climate and biodiversity data, but it is isolated. Terraware connects this data together and presents it in a way that is easy to understand.
## Features
Users are presented with an interactible map and can choose between three tabs: Explore, Endangered Species, and View Wildfires. On the explore and view wildfire tabs, users can select the What You Can Do To Help button.
### Explore
On the explore tab, users may click on any point and view climate data at that location. This data includes AQI (Air Quality Index) (determned by selected coordinates), average drought level per the last few months (determined by the selected state), and the differernce in temperature between Mar 2025 - Apr 2025 to Mar 2026 - Apr 2026 (determined by selected state, based off a calculated centroid).
### Endangered Species
On the endangered Species tab, users may click on any point and view a list of endangered species in that state. Users will see the species name, common name, and status.
### View Wildfires
On the view wildfires tab, users may select multiple states and view a data visualization of the current wildfires. Included with this data, is the number of wildfires detected overall out of the selected states, the number of wildfires in each selected state, the number of confident wildfires in each state, and the number of fires detected in the daylight.
### AI Action Plan and Summary
Based on the current state selected, users can view an AI generated summary of the climate data (including relavant extrapolations based on the data), multiple actionable steps the user could take to protect both themselves and the environment based on the climate data, and a description of how the climate effects some of the local endangered wildlife.
## Tech Stack
### Frontend
The frontend was built in **React**, **Next.js**, and **Tailwind**.
### AI
The LLM used was **Claude** by Anthropic.
### Data Sources
#### AQI
AQI data was provided by **AirNow**.
#### Wildfires
Wildfire data was provides by **NASA FIRMS**.
#### Drought
Drought data was provided by **U.S. Drought Monitor**.
#### Temperature
Temperature data was provided by **Meteo**.
#### Endangered Species
Endangered species data was provided by **IUCN** and **GBIF**.
### Deployment
Terraware is deployed on **Vercel**.
## How it Works
On the intial page load, the NASA FIRMS endpoint is called to fetch wildfire data for the country. When the user selects a state in the view wildfire tab, we use Turf to filter the list of fires to fires that lie within the bounds of the state. These fires are then filtered again for high and medium confidence, they are then rendered on the state. When the user selects a state in the explore tab, we concurrently fetch AQI data, drought data, temperature data, and we filter our pre seeded endangered species data. Drought data is cached to increase performance. We use a generative AI to corroborate the data and provide climate summaries, actionable steps that users can realistically take to both protect themselves and the environment, and a desciption of how the climate affects the endangered species of the selected state.
## Cost & Scalability
Claude API calls are relatively cheap. About 1000 AI action plans and summaries can be generated for about four dollars. The main expenses that come with scaling are upgraded API tiers, Vercel, and Anthropic credits. In its current state, Vercel and the data APIS are free, while Claude has cost around twenty two cents.
## Future Plans
We would like to integrate more data pertinent to the environment. An example is forestry data; with forestry data, a user could compare AQI, drought, and wildfire data with a forestry map layer to gain new insights on the relations. Another example is migratory paterns for birds; a user would be able to observe how wildfires affect migration patterns. We would also like to integrate a chat feature with Claude to allow users to ask questions about the data summary presented.
## Team
Terraware was built by Gavin Wilson - A computer science student at the University of Colorado Boulder with a minor in computational biology and Grace Lafary - A biology student on a pre-vet track at Colorado State University
## Getting Started
To get started simply visit https://terraware-swart.vercel.app/ and click on a state!
