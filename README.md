# Capre - Cross-Application Replication

Capre provides a database agnostic data replication between a single master and
multiple slave applications.

To minimise unnecessary transfer slave applications are sent data sets 
containing only the items that have been created or updated since the last
replication.  

The cornerstone of this solution is an incrementing sequence id. This
method is partially inspired by the CouchDB, MySQL and Mongo approaches to
replication.

The 'master' data store keeps a sequence id, starting at 0. As new data is created or updated, the 
sequence id is incremented. Data that has changed 

Capre 'slaves' keep track of their own internal 
sequence id, and when their internal sequence id differs to that of the master, 
they then notify the master they need to pull all the data that's changed
since their sequence id.

The master locates all of the resources whose sequence id is higher
than the sequence id supplied by the client. The set of changed data is
then sent to the client to merge with their existing data set.

Each time the slave communicates with the master it will send its sequence id, 
and the master always responds with it's most up-to-date sequence id, along 
with any fresh data.

![Capre Architecture](https://docs.google.com/drawings/pub?id=18_wjuTZhvBqXN6DNbymOSYlE6ohg1PX0pjcg3gVd50k&amp;w=755&amp;h=400)
