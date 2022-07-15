1. Make sure, you have a working Docker installation on your machine.

2. In a terminal, run the following commands to install and run `planutils`:
```
docker pull aiplanning/planutils

docker run -it --privileged -p 5000:8080 -v <Path_To_PDDL_Domain_And_Problem_Folder_On_Your_Machine>:/app aiplanning/planutils
```

3. Inside the CLI of the new Docker container, run the following commands to setup a SMTPLAN+ server:
```
planutils install smtplan
pip install flask
planutils server --host 0.0.0.0
```


