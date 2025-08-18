#!/bin/bash
echo "Validating that source branch is not using outdated version of the target branch"
source_hash=$(git log --pretty=format:%H -1)
echo "source_hash= $source_hash"
target_hash=$(git rev-parse upstream/develop) 
echo "target_hash= $target_hash" 
if [ $source_hash != $target_hash ]; then 
    parent_hash=$(git log --pretty=format:%H | grep $target_hash) 
    echo "parent_hash= $parent_hash"
    if [ -z $parent_hash ]; then 
        echo "The source branch does not appear to be using the latest commit from the target branch."
    else 

        echo "The source branch contains the commit hash of the target branch in its history."
    fi
    else
        echo "The source branch has the same commit hash as the hash of the target branch."
fi
