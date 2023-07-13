=====================================================================================================================================================================
How to run 
---------------------------------------------------------------------------------------------------------------------------------------------------------------------

The script is simple python script. 
In a HPC cluster where several jobs runs, it collects data from all the running jobs. It finds all the communication paths between nodes involved in the job at run time. 
As infiniband cluster have a lid for every device be it a switch or node, every command like trace_route or perfquery take inputs as lid. 
Getting output in form of lids is like having IP address and becomes different in reading. So we use a input called HPC_NODE_MAP which actually help us lid to name conversion. 

To run use commands "python3 getcounters.py" 


It will produce 5 files as a result. Sample 5 files name is shown below. Each file have a timestamp as suffix in form of DDMMYYYYHHMM.

qstat_data_050620231535.txt
jobs_table_050620231535.txt
paths_table_050620231535.txt
temp_device_port_050620231535.txt
counters_table_050620231535.txt 

Three files which have word table is important for our analysis. 
jobs_table_050620231535
paths_table_050620231535
counters_table_050620231535

=====================================================================================================================================================================
Below is descriptions about the files : 
---------------------------------------------------------------------------------------------------------------------------------------------------------------------
First jobs_table_DDMMYYYYHHMM.txt
e.g jobs_table_050620231535.txt
JobID UserName QueueName TotalNodes TotalCores RequiredTime JobState ElaspedTime NodeList
1006468.un05 anandha2 large 16 320 96:00 R 71:32 hpc029,hpc063,hpc243,hpc244,hpc266,hpc267,hpc311,hpc375,hpc386,hpc418,hpc420,hpc423,hpc425,hpc428,hpc463,hpc467

The header lines explain the details of field in the file. 
---------------------------------------------------------------------------------------------------------------------------------------------------------------------
Second paths_table_DDMMYYYYHHMM.txt
e.g paths_table_050620231535.txt
hpc029-hpc063 1006468.un05 hpc029:1->IB_SW_02:11->IB_SW_02:27->IBB1_L01:18->IBB1_L01:27->IBB1_S09:1->IBB1_S09:2->IBB1_L02:27->IBB1_L02:10->IB_SW_04:19->IB_SW_04:9->hpc063:1
hpc029-hpc243 1006468.un05 hpc029:1->IB_SW_02:11->IB_SW_02:31->IBB2_L01:13->IBB2_L01:31->IBB2_S13:1->IBB2_S13:7->IBB2_L07:31->IBB2_L07:13->IB_SW_14:31->IB_SW_14:13->hpc243:1

The first field is a pair of nodes
The second field is job-id
Third field is path which trace_route

---------------------------------------------------------------------------------------------------------------------------------------------------------------------

Third counters_table_DDMMYYYYHHMM.txt
e.g counters_table_050620231535.txt
hpc029 1 3163931403 3194437987 050620231535
IB_SW_02 11 3194438441 3163931858 050620231535
IB_SW_02 27 928131230 1336774923 050620231535

The first field is Device name 
The second field is Port number of device 
The Third field is Number of transmitted packets
The forth field is Number of received packets
The fifth field is timestamp

---------------------------------------------------------------------------------------------------------------------------------------------------------------------

Some descriptions about the names included in the data:
->nodes are named hpc001 - hpc888. A few others nodes are also there. Like hm001 repreatents high memory node. 
->L1 switch has name IBSW_1 to IBSW_52
->L2 switch has the name IBB1_SW_L01 to IBB1_SW_L27. There are two director switches, IBB1 and IBB2, each with 27 line modules.
->L3 switch has IBB1_SW_S01 to IBB1_SW_S18. Line modules of Director switches are connected with spine modules providing L3 connectivity.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------
Sample HPC_NODE_MAP 
e.g HPC13_NODE_MAP 
0x0002c9030090ec00 IB_SW_01 44
0xf4521403000dcbc0 IB_SW_02 91
0xf4521403000dcac0 IB_SW_03 627
0xf4521403000dd6c0 IB_SW_04 637


