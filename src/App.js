import {
  Button,
  ChakraProvider,
  Flex,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  theme,
  Box,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import TodoList from "./abis/TodoList.json";

function App() {
  const [account, setAccount] = useState("");
  const [todoList, setTodoList] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [isAdd, setIsAdd] = useState(false);

  const [tasks, setTasks] = useState([]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await window.web3.eth.getAccounts();
      setAccount(accounts[0]);
      const web3 = window.web3;
      const networkId = await web3.eth.net.getId();
      const networkData = TodoList.networks[networkId];
      setTodoList(new web3.eth.Contract(TodoList.abi, networkData.address));
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadData = async () => {
    const taskCount = await todoList?.methods?.taskCount().call();
    const arr = [];
    for (var i = 1; i <= taskCount; i++) {
      arr.push(await todoList.methods.tasks(taskCount).call());
    }
    setTasks(arr);
  };

  const createTask = async (content) => {
    await todoList?.methods
      .createTask(content)
      .send({ from: account })
      .on("transactionHash", (...hash) => {
        setIsAdd(true);
      });
  };

  useEffect(() => {
    loadWeb3();
    loadData();
  }, []);

  useEffect(() => {
    if (isAdd) {
      loadData();
      setIsAdd(false);
    }
  }, [isAdd]);

  console.log(tasks);

  return (
    <ChakraProvider theme={theme}>
      <Flex flexDir="column" h="100vh">
        <Flex align={"center"} justify={"space-between"} h="5vh" px="5">
          <Box>Todo</Box>
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
            {account}
          </Heading>
        </Flex>
        <Flex
          align={"center"}
          justify={"center"}
          bg={useColorModeValue("gray.50", "gray.800")}
          h="100%"
        >
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={useColorModeValue("white", "gray.700")}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
              Create Todo
            </Heading>
            <Text
              fontSize={{ base: "sm", sm: "md" }}
              color={useColorModeValue("gray.800", "gray.400")}
            >
              ....................
            </Text>
            <FormControl id="email">
              <Input
                placeholder="Content......."
                _placeholder={{ color: "gray.500" }}
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
              />
            </FormControl>
            <Stack spacing={6}>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={() => createTask(taskInput)}
              >
                Create
              </Button>
            </Stack>
          </Stack>
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={useColorModeValue("white", "gray.700")}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
            ml={3}
          >
            <FormControl id="email">
              <Flex align="center">
                {tasks.map((i) => (
                  <>
                    <Checkbox checked={i.completed} />
                    <Text
                      ml={3}
                      fontSize={{ base: "sm", sm: "md" }}
                      color="gray.400"
                    >
                      {i.content}
                    </Text>
                  </>
                ))}
              </Flex>
            </FormControl>
          </Stack>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
