# Custom App

## Overview

Use this template to get your containerized application running in Oasis ROFL in
just a few minutes.

## Prerequisites

Before ROFLizing your application, ensure you have:

- [Compose] file (e.g. `docker-compose.yaml` or `podman-compose.yaml`)

[Compose]: https://compose-spec.io/

## Step-by-Step Setup Instructions

### Step 1: Input metadata

Provide basic information about your application.

### Step 2: Setup containers

1. **`compose.yaml`** (Required)

    - Copy your [Compose] file (e.g. `docker-compose.yaml` or
      `podman-compose.yaml`) to the *compose.yaml* input field
    - Convert the environment variables in the Compose file to variables of the
      form:

        ```yaml
        VARIABLE_A=${VARIABLE_A}
        VARIABLE_B=${VARIABLE_B}
        ...
        ```

2. **Secrets** (Required)

    - Specify the names and values of the environment variables that are defined
      in the Compose file and add them to the table one by one.

### Step 3: Configure machine

Choose the appropriate size of machine where your application will and the
duration that the machine should run. You are able to extend the duration later
by topping up the machine.

### Step 4: Payment

Pay for registering your app with ROFL (100 ROSE) and the chosen machine's
costs.

### Step 5: Deployment

Sign appropriate transactions with MetaMask and in a few minutes your
application will be up & running in ROFL.
