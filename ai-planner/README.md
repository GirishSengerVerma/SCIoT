# SCIoT SS22 Group 30 DWA (AI Planner)

## Solver

The PDDL solver we used is the publicly available [ENHSP20-0.9.4](https://gitlab.com/enricos83/ENHSP-Public/-/tree/enhsp20-0.9.4/) planner.

## PDDL Files

The `domain.pddl` and `problem_template.pddl` files for our AI planner are located inside `../dashboard-web-app/services/ai-planner` as the AI planner is invoked by the DWA backend.
You can also find some exaple problem files as well as the generated problem files there.

## Development and Testing

### VS Code Extension

First, add the following extension to your VS Code:

- [PDDL Extension](https://marketplace.visualstudio.com/items?itemName=jan-dolejsi.pddl)

### Setup Validator

Then open the directory `../dashboard-web-app/services/ai-planner` in VS Code.
If you are prompted to install a validator, accept installing the `VAL` validator.

### Setup ENHSP Planner

Then, in the bar at the bottom of VS Code, change the currently selected planner by

1. clicking on 'http://solver.planning.domains/solve'
2. choosing 'Create new planner configuration' in the opened menu
3. choosing 'Input a command' in the new menu
4. entering 'java -jar <Path_to_this_repo>\\ai-planner\\enhsp20-0.9.4\\enhsp.jar' in the new menu
5. entering '$(planner) $(options) -o $(domain) -f $(problem) -s WAStar' in the new menu
6. make sure the new planner called 'enhsp.jar' is selected in the bottom bar ins VS Code

### Run Tests

After that, make sure that in the testing tab the domain and example problem files are recognized correctly.
You can then edit the domain file or create new example problem files with the help of the excellent IDE support from the PDDL extension.
You can then directly run the tests from inside this Testing tab which will use the online PDDL solver service for executing.
